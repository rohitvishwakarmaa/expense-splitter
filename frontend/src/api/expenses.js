import client from './client';

export const addExpense = (data) => client.post('/expenses/', data);
export const getExpensesByGroup = (groupId) => client.get(`/expenses/group/${groupId}`);
