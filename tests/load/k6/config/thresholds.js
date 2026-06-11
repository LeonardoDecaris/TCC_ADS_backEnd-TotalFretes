export const smokeThresholds = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<800'],
};

export const authThresholds = {
  http_req_failed: ['rate<0.02'],
  http_req_duration: ['p(95)<1000'],
  'http_req_duration{name:auth_login}': ['p(95)<800'],
};

export const readThresholds = {
  http_req_failed: ['rate<0.02'],
  http_req_duration: ['p(95)<1200'],
  'http_req_duration{name:freight_list}': ['p(95)<1000'],
};

export const writeThresholds = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<2000'],
};
