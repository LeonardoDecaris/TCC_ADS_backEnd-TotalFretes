const COMPANY_LOGO_WIDTH = 200;
const COMPANY_LOGO_HEIGHT = 83;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export type ValidateCompanyLogoResult =
	| { valid: true; width: number; height: number }
	| { valid: false; reason: 'INVALID_PNG' | 'INVALID_DIMENSIONS' };

export function validateCompanyLogoPng(buffer: Buffer): ValidateCompanyLogoResult {
	if (buffer.length < 24) {
		return { valid: false, reason: 'INVALID_PNG' };
	}

	if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
		return { valid: false, reason: 'INVALID_PNG' };
	}

	const chunkType = buffer.subarray(12, 16).toString('ascii');
	if (chunkType !== 'IHDR') {
		return { valid: false, reason: 'INVALID_PNG' };
	}

	const width = buffer.readUInt32BE(16);
	const height = buffer.readUInt32BE(20);

	if (width !== COMPANY_LOGO_WIDTH || height !== COMPANY_LOGO_HEIGHT) {
		return { valid: false, reason: 'INVALID_DIMENSIONS' };
	}

	return { valid: true, width, height };
}
