import http from "http";

const PORT = Number(process.env.PORT || 9404);
const SOCKET_PATH = "/var/run/docker.sock";
const API_VERSION = "v1.41";
const POLL_INTERVAL_MS = 10000;

let metricsBody = [
  "# HELP docker_stats_exporter_up Whether exporter last scrape succeeded.",
  "# TYPE docker_stats_exporter_up gauge",
  "docker_stats_exporter_up 0",
].join("\n");

function esc(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function dockerGet(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        socketPath: SOCKET_PATH,
        path,
        method: "GET",
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Docker API ${path} returned ${res.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

function toMetrics(rows) {
  const lines = [
    "# HELP docker_stats_exporter_up Whether exporter last scrape succeeded.",
    "# TYPE docker_stats_exporter_up gauge",
    "docker_stats_exporter_up 1",
    "# HELP docker_service_cpu_percent CPU usage percentage by service/container.",
    "# TYPE docker_service_cpu_percent gauge",
    "# HELP docker_service_memory_usage_bytes Memory usage in bytes by service/container.",
    "# TYPE docker_service_memory_usage_bytes gauge",
    "# HELP docker_service_memory_limit_bytes Memory limit in bytes by service/container.",
    "# TYPE docker_service_memory_limit_bytes gauge",
    "# HELP docker_service_memory_percent Memory usage percentage by service/container.",
    "# TYPE docker_service_memory_percent gauge",
    "# HELP docker_stats_exporter_last_scrape_timestamp_seconds Last successful scrape Unix timestamp.",
    "# TYPE docker_stats_exporter_last_scrape_timestamp_seconds gauge",
  ];

  for (const row of rows) {
    const labels = `service="${esc(row.service)}",container="${esc(row.container)}"`;
    lines.push(`docker_service_cpu_percent{${labels}} ${row.cpuPercent}`);
    lines.push(`docker_service_memory_usage_bytes{${labels}} ${row.memoryUsageBytes}`);
    lines.push(`docker_service_memory_limit_bytes{${labels}} ${row.memoryLimitBytes}`);
    lines.push(`docker_service_memory_percent{${labels}} ${row.memoryPercent}`);
  }

  lines.push(`docker_stats_exporter_last_scrape_timestamp_seconds ${Date.now() / 1000}`);
  return lines.join("\n");
}

async function collect() {
  const containers = await dockerGet(`/${API_VERSION}/containers/json?all=0`);
  const rows = [];

  for (const c of containers) {
    try {
      const id = c.Id;
      const container = (c.Names?.[0] || id.slice(0, 12)).replace(/^\//, "");
      const service = c.Labels?.["com.docker.compose.service"] || container;

      const stats = await dockerGet(`/${API_VERSION}/containers/${id}/stats?stream=false`);
      const cpuDelta =
        (stats?.cpu_stats?.cpu_usage?.total_usage ?? 0) -
        (stats?.precpu_stats?.cpu_usage?.total_usage ?? 0);
      const systemDelta =
        (stats?.cpu_stats?.system_cpu_usage ?? 0) -
        (stats?.precpu_stats?.system_cpu_usage ?? 0);
      const onlineCpus =
        stats?.cpu_stats?.online_cpus ??
        stats?.cpu_stats?.cpu_usage?.percpu_usage?.length ??
        1;
      const cpuPercent =
        cpuDelta > 0 && systemDelta > 0 ? (cpuDelta / systemDelta) * onlineCpus * 100 : 0;

      const memoryUsageBytes = stats?.memory_stats?.usage ?? 0;
      const memoryLimitBytes = stats?.memory_stats?.limit ?? 0;
      const memoryPercent =
        memoryLimitBytes > 0 ? (memoryUsageBytes / memoryLimitBytes) * 100 : 0;

      rows.push({
        service,
        container,
        cpuPercent: Number(cpuPercent.toFixed(4)),
        memoryUsageBytes: Number(memoryUsageBytes),
        memoryLimitBytes: Number(memoryLimitBytes),
        memoryPercent: Number(memoryPercent.toFixed(4)),
      });
    } catch (_err) {
      // Ignore one bad container stats payload and keep exporter healthy.
    }
  }

  metricsBody = toMetrics(rows);
}

async function pollLoop() {
  try {
    await collect();
  } catch (err) {
    metricsBody = [
      "# HELP docker_stats_exporter_up Whether exporter last scrape succeeded.",
      "# TYPE docker_stats_exporter_up gauge",
      "docker_stats_exporter_up 0",
    ].join("\n");
  } finally {
    setTimeout(pollLoop, POLL_INTERVAL_MS);
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/metrics") {
    res.writeHead(200, { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" });
    res.end(`${metricsBody}\n`);
    return;
  }

  if (req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("ok\n");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("not found\n");
});

server.listen(PORT, () => {
  pollLoop();
});
