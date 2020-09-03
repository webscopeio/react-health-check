// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { serviceHealth } from './health';

export default (_req, res) => {
  const health = serviceHealth.getHealth;
  serviceHealth.toggle();

  res.statusCode = 200;
  res.json({ health });
};
