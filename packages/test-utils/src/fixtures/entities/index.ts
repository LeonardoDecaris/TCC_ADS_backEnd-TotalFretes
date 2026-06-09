export const validAccountCreate = {
  email: 'new.user@test.com',
  subject_id: 100,
  account_type_id: 1,
  password: 'Senha@123',
};

export const validAccountAdminCreate = {
  email: 'admin.new@test.com',
  password: 'Senha@123',
};

export const validAccountPatch = {
  email: 'updated@test.com',
};

export const validCompanyCreate = {
  name: 'Empresa Teste LTDA',
  email: 'empresa@test.com',
  birthFundation: '2010-01-15',
  phoneNumber: '11999990000',
  cnpj: '11222333000181',
};

export const validAddressCreate = {
  country: 'Brasil',
  cep: '01310100',
  street: 'Av Paulista',
  district: 'Bela Vista',
  number: '1000',
  city: 'São Paulo',
  state: 'SP',
};

export const validFreightCreate = {
  cargoType_id: 1,
  name: 'Frete Teste',
  origin_label: 'São Paulo, SP',
  origin_lat: -23.55,
  origin_lng: -46.63,
  destination_label: 'Rio de Janeiro, RJ',
  destination_lat: -22.9,
  destination_lng: -43.2,
  originalValue: 1500,
  weight: 500,
};

export const validCargoTypeCreate = {
  name: 'Grãos',
};

export const validProposalCreate = {
  freight_id: 1,
  value: 1200,
};

export const validStatusTypeCreate = {
  name: 'Em andamento',
};

export const validCnhCreate = {
  name: 'B',
  description: 'Categoria B',
};

export const validVehicleTypeCreate = {
  nome: 'Truck',
  axes: 2,
  weight: 8000,
  capacityWeight: 15000,
  length: 12.5,
};

export const validGroupVehicleTypeCreate = {
  nome: 'Pesados',
  cnhType_id: 1,
};

export const validVehicleCreate = {
  plateNumber: 'ABC1D23',
  city: 'São Paulo',
  stateUF: 'SP',
  country: 'Brasil',
  vehicleType_id: 1,
};

export const validUserCreate = {
  name: 'Motorista Teste',
  email: 'motorista@test.com',
  birthDate: '1990-05-20',
  phoneNumber: '11988887777',
  cpf: '52998224725',
  sex: 'M',
  useGlasses: false,
  isDeficient: false,
  cnhNumber: '12345678901',
  cnhType_id: 1,
};

export const storageUserImageFields = {
  ownerType: 'USER',
  ownerId: '10',
};

export const storageCompanyImageFields = {
  companyId: '5',
};
