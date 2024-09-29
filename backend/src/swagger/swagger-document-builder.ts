import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SwaggerUI } from "./swagger-ui.class";
import { _SWAGGER_TAGS } from "./swagger-tags/swagger-tags.constants";

export class SwaggerDocumentBuilder {
    constructor(private readonly app: INestApplication<any>) {}

    public setupSwagger() {
        const document = this.createDocument();

        const swaggerUI = new SwaggerUI();
        SwaggerModule.setup(
            "core/docs",
            this.app,
            document,
            swaggerUI.customOptions,
        );
    }

    private buildConfig() {
        const docBuilder = new DocumentBuilder()
            .setTitle("Rutube.Support")
            .setDescription(
                "Система интеллектуального помощника для генерации ответов на основе базы знаний часто задаваемых вопросов ",
            )
            .setVersion("1.0")
            .addServer("https://dev.pincode-dev.ru/rutube", "Production")
            .addServer("/", "Dev")
            .addBearerAuth({
                bearerFormat: "Bearer",
                scheme: "Bearer",
                type: "http",
                in: "Header",
            });

        _SWAGGER_TAGS.forEach((tag) => {
            docBuilder.addTag(tag.name, tag.description);
        });

        return docBuilder.build();
    }

    private createDocument() {
        const config = this.buildConfig();
        return SwaggerModule.createDocument(this.app, config);
    }
}
