import 'dotenv/config';
import { app, logger, registerApiRoutes } from './app';

const PORT = process.env.PORT ?? 4000;

async function startServer() {
  await registerApiRoutes(app);

  app.listen(PORT, () => {
    logger.info(`Family Nudge API running on port ${PORT}`);
  });
}

void startServer();
