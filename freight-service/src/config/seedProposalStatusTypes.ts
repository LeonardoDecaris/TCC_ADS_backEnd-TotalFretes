import ProposalStatusType from '../models/proposalsStatusTypes.model';
import { ProposalStatusSlug } from './statusTypes.constants';

const DEFAULT_PROPOSAL_STATUS_TYPES: readonly string[] = [
	ProposalStatusSlug.PENDING,
	ProposalStatusSlug.ACCEPTED,
	ProposalStatusSlug.REJECTED,
	ProposalStatusSlug.WITHDRAWN,
];

export const seedProposalStatusTypes = async (): Promise<void> => {
	for (const name of DEFAULT_PROPOSAL_STATUS_TYPES) {
		await ProposalStatusType.findOrCreate({
			where: { name },
			defaults: { name },
		});
	}
};
