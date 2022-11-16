import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { isAuthenticated } from './common/wcp/WcpAuthorization';

import Authorize from './common/components/Authorize';
import ErrorNotAuthenticated from './common/components/ErrorNotAuthenticated';
import ErrorAppNotConfigured from './common/components/ErrorAppNotConfigured';
import ErrorNotFound from './common/components/ErrorNotFound';
import Home from './common/components/Home';

import EnergySites from './app-examples/energy-sites';

const AppRoutes = () => {
  return (
    <Routes>
      <Route exact path="/" element={<Home/>} />
      <Route path="/authorize" element={<Authorize/>} />
      <Route path="/energy-sites" element={isAuthenticated() ? <EnergySites/> : <ErrorNotAuthenticated/>} />
      <Route element={ErrorNotFound} />
    </Routes>
  );
};

export default AppRoutes;