# Checklist operacional dos dashboards (produção)

## Janela de 24h (acompanhamento diário)
- `Operacao_Producao_Overview`: validar se erros e warnings ficaram dentro do padrão esperado.
- `Capacidade_Producao_LogBased`: verificar crescimento de throughput e sinais de timeout/retry/queue.
- `Incidentes_Drilldown`: revisar eventos críticos e correlacionar com traces quando houver `trace_id`.

## Janela de 7d (tendência e capacidade)
- Comparar tendência de volume de logs e taxa de erro por container.
- Identificar rotas com aumento consistente de erro 5xx.
- Ajustar thresholds de alerta visual para refletir novo baseline semanal.

## Thresholds iniciais configurados
- Erros (15m): alerta a partir de 50, crítico a partir de 200.
- Warnings (15m): alerta a partir de 100, crítico a partir de 500.
- Latência p95 por logs: alerta a partir de 500 ms, crítico a partir de 1000 ms.
- Taxa de erro 5xx: alerta a partir de 2%, crítico a partir de 5%.

## Observação importante
Sem Prometheus/exporters, estes dashboards mostram capacidade inferida por comportamento de logs.
Use-os para priorização operacional e investigação rápida; não como métrica hard de CPU/memória/disco.
