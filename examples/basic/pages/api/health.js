// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

class ServiceHealth {
  constructor() {
    this.health = true;
  }

  get getHealth() {
    return this.health;
  }

  toggle() {
    this.health = !this.health;
  }
}

export const serviceHealth = new ServiceHealth();

export default (_req, res) => {
  const health = serviceHealth.getHealth;

  res.statusCode = health ? 200 : 500;
  res.json({ health });
};
