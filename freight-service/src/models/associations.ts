import Freight from './freight.model';
import FreightStatusHistory from './freightStatusHistory.model';

Freight.hasMany(FreightStatusHistory, {
	foreignKey: 'freight_id',
	as: 'FreightStatusHistories',
});
