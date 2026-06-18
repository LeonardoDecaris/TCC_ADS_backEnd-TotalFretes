import {
  createProposalSchema,
  proposalFreightSummaryQuerySchema,
  proposalListQuerySchema,
  rejectProposalSchema,
} from '../../src/schemas/proposals.schemas';

describe('createProposalSchema', () => {
  it('aceita freight_id e value válidos', () => {
    const result = createProposalSchema.safeParse({
      freight_id: '10',
      value: '1500.50',
      submitted_lat: -23.55,
      submitted_lng: -46.63,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.freight_id).toBe(10);
      expect(result.data.value).toBe(1500.5);
    }
  });

  it('rejeita value negativo', () => {
    const result = createProposalSchema.safeParse({ freight_id: 1, value: -1 });
    expect(result.success).toBe(false);
  });

  it('exige submitted_lat e submitted_lng válidos', () => {
    const missing = createProposalSchema.safeParse({ freight_id: 1, value: 100 });
    expect(missing.success).toBe(false);

    const invalidLat = createProposalSchema.safeParse({
      freight_id: 1,
      value: 100,
      submitted_lat: 95,
      submitted_lng: -46.6333,
    });
    expect(invalidLat.success).toBe(false);
  });
});

describe('rejectProposalSchema', () => {
  it('aceita body undefined (PATCH sem corpo)', () => {
    const result = rejectProposalSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('rejeita comentário acima de 500 caracteres', () => {
    const result = rejectProposalSchema.safeParse({ rejection_comment: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe('proposalListQuerySchema', () => {
  it('aplica default enviada quando page informado sem status', () => {
    const result = proposalListQuerySchema.safeParse({ page: '1' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.proposal_status).toBe('enviada');
    }
  });

  it('normaliza status múltiplos separados por vírgula', () => {
    const result = proposalListQuerySchema.safeParse({ status: 'enviada, aceita' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toEqual(['enviada', 'aceita']);
    }
  });
});

describe('proposalFreightSummaryQuerySchema', () => {
  it('aplica defaults page, limit e proposal_status', () => {
    const result = proposalFreightSummaryQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(6);
      expect(result.data.proposal_status).toBe('enviada');
    }
  });
});
