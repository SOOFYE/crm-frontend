// src/services/authService.js

import axios from 'axios';

const URL = `${process.env.REACT_APP_BACKEND_URL}auth/login`;

export const loginService = (username, password) => {
  return axios.post(URL, {
    username: username,
    password: password
  });
};