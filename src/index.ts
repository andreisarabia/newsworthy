import Application from './Application';

const main = async () => {
  const app = await Application.instance.setup();

  app.start();
};

main().catch(err => console.error(err));
