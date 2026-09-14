import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { buildOpenApiDocument } from "./swagger";
import { API_GLOBAL_PREFIX } from "./constants";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.enableCors(); // TODO: restrict to known web/app origins before production launch.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== "production") {
    const document = buildOpenApiDocument(app);
    SwaggerModule.setup("docs", app, document);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`[api] listening on http://localhost:${port}/${API_GLOBAL_PREFIX}`);
}

void bootstrap();
