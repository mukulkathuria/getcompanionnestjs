import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
// import * as fs from 'fs';
import { ClusterService } from './Services/cluster.service';

ClusterService.clusterize(async () => {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    }),
  );
  if (process.env.NODE_ENV !== 'production') {
    app.getHttpAdapter().getInstance().set('json spaces', 2);
  }
  const Port = process.env['DEFAULT_PORT'];
  const Host = process.env['DEFAULT_HOST'];
  await app.listen(Port, Host);
  console.log(`Server is running on ${Port}`);
});

// (async () => {
//   const app = await NestFactory.create(AppModule, {
//     cors: true,
//     httpsOptions:{
//       key: fs.readFileSync('src/certificates/localhost-key.pem'),
//       cert: fs.readFileSync('src/certificates/localhost.pem')
//     }
//   });
//   const Port = process.env['DEFAULT_PORT'];
//   const Host = process.env['DEFAULT_HOST'];
//   await app.listen(Port, Host);
//   console.log('Server is running');
// })();
