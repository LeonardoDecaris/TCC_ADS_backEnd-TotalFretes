# Scripts auxiliares — freight-service

## Seeds no startup (padrão)

Ao subir o serviço (`npm run dev` ou container Docker), após `sequelize.sync`, roda automaticamente:

1. Tipos de carga  
2. Status de frete  
3. Status de proposta  
4. Fretes/propostas de teste (`TF-TEST-*`), se `SEED_TEST_DATA` não for `false`

Configure no `.env`:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `SEED_TEST_COMPANY_ID` | `1` | `company_id` dos fretes de teste |
| `SEED_TEST_DRIVER_IDS` | `2,3,4,5` | IDs de motoristas (mín. 4) |
| `SEED_TEST_DATA` | (ativo) | Defina `false` para não criar TF-TEST-* no startup |

## Rodar só os seeds (sem API)

```bash
npm run seed:test
```

Útil após ajustar `SEED_TEST_*` sem reiniciar o servidor inteiro.
