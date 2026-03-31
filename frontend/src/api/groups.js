import client from './client';

export const createGroup = (data) => client.post('/groups/', data);
export const getGroup = (id) => client.get(`/groups/${id}`);
export const listGroups = () => client.get('/groups/');
