import client from './client';

export const getBalances = (groupId) => client.get(`/balances/${groupId}`);
