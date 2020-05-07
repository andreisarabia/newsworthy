import Application from './app';

const main = async () => {
  const app = await Application.instance.setup();

  app.start();
};

main().catch(err => console.error(err));
