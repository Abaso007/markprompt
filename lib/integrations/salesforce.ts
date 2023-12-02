import { NangoIntegrationId } from '@/types/types';

export type SalesforceEnvironment = 'production' | 'sandbox';
export type SalesforceDatabaseType = 'knowledge' | 'case';

export const getSalesforceDatabaseIntegrationId = (
  databaseType: SalesforceDatabaseType,
  environment: SalesforceEnvironment,
): NangoIntegrationId => {
  switch (databaseType) {
    case 'knowledge':
      return environment === 'production'
        ? 'salesforce-knowledge'
        : 'salesforce-knowledge-sandbox';
    case 'case':
      return environment === 'production'
        ? 'salesforce-case'
        : 'salesforce-case-sandbox';
  }
};
