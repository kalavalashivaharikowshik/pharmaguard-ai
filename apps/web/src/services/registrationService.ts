import { api } from './api';

export const registrationService = {

  submit(data: {
    organizationName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    licenseNumber: string;
    role: string;
  }) {

    return api
      .post(
        '/registration',
        data,
      )
      .then(res => res.data);

  },

  getAll() {

    return api
      .get('/registration')
      .then(res => res.data);

  },

  getOne(
    id: string,
  ) {

    return api
      .get(`/registration/${id}`)
      .then(res => res.data);

  },

  getDocuments(
    id: string,
  ) {

    return api
      .get(
        `/registration/${id}/documents`,
      )
      .then(
        res => res.data,
      );

  },

  approve(
    id: string,
  ) {

    return api
      .patch(
        `/registration/${id}/approve`,
      )
      .then(res => res.data);

  },

  reject(
    id: string,
    reason: string,
  ) {

    return api
      .patch(
        `/registration/${id}/reject`,
        {
          reason,
        },
      )
      .then(res => res.data);

  },

};