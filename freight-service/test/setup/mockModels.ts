import { createModelMock, type ModelMock } from '../../../packages/test-utils/src/mocks/sequelizeModel';
import { mockDatabaseModule } from '../../../packages/test-utils/src/jest/mockDatabase';

export const cargoTypeModel: ModelMock = createModelMock();
export const freightModel: ModelMock = createModelMock();
export const freightStatusTypeModel: ModelMock = createModelMock();
export const proposalModel: ModelMock = createModelMock();
export const proposalStatusTypeModel: ModelMock = createModelMock();

jest.mock('../../src/config/database', () => mockDatabaseModule());

jest.mock('../../src/services/enrichment.service', () => ({
  enrichFreightWithCompany: jest.fn(async (data: unknown) => data),
  enrichFreightsWithCompany: jest.fn(async (data: unknown) => data),
  enrichFreightsCargoImages: jest.fn(async (data: unknown) => data),
  enrichCargoTypeWithImage: jest.fn(async (data: unknown) => data),
  enrichCargoTypesWithImages: jest.fn(async (data: unknown) => data),
  enrichProposalWithDriver: jest.fn(async (data: unknown) => data),
  enrichProposalsWithDriver: jest.fn(async (data: unknown) => data),
  getEnrichmentContext: jest.fn(() => ({})),
}));

jest.mock('../../src/services/freight.service', () => ({
  createFreightRecord: jest.fn(),
  listFreights: jest.fn(),
  getFreightByIdRecord: jest.fn(),
  getFreightByUserIdRecord: jest.fn(),
  updateFreightRecord: jest.fn(),
  deleteFreightRecord: jest.fn(),
  cancelFreightRecord: jest.fn(),
  completeFreightRecord: jest.fn(),
  assertCompanyCanViewFreight: jest.fn(),
  FreightNotFoundError: class FreightNotFoundError extends Error {},
  FreightForbiddenError: class FreightForbiddenError extends Error {},
  FreightValidationError: class FreightValidationError {
    code = 'VALIDATION_ERROR';
  },
}));

jest.mock('../../src/services/proposal.service', () => ({
  createProposalRecord: jest.fn(),
  listProposals: jest.fn(),
  getProposalByIdRecord: jest.fn(),
  updateProposalRecord: jest.fn(),
  deleteProposalRecord: jest.fn(),
  assertCanViewProposal: jest.fn(),
  fetchProposalFreightSummaryRecord: jest.fn(),
  acceptProposalRecord: jest.fn(),
  confirmProposalByDriverRecord: jest.fn(),
  declineProposalByDriverRecord: jest.fn(),
  rejectProposalRecord: jest.fn(),
  ProposalNotFoundError: class ProposalNotFoundError extends Error {},
  ProposalForbiddenError: class ProposalForbiddenError extends Error {},
  ProposalValidationError: class ProposalValidationError extends Error {},
}));

jest.mock('../../src/models/cargoTypes.model', () => ({
  __esModule: true,
  default: cargoTypeModel,
}));
jest.mock('../../src/models/freight.model', () => ({
  __esModule: true,
  default: freightModel,
}));
jest.mock('../../src/models/freightStatusTypes.model', () => ({
  __esModule: true,
  default: freightStatusTypeModel,
}));
jest.mock('../../src/models/proposals.model', () => ({
  __esModule: true,
  default: proposalModel,
}));
jest.mock('../../src/models/proposalsStatusTypes.model', () => ({
  __esModule: true,
  default: proposalStatusTypeModel,
}));
jest.mock('../../src/models/freightStatusHistory.model', () => ({
  __esModule: true,
  default: createModelMock(),
}));
