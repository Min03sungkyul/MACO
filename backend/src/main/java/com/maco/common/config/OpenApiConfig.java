package com.maco.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** /swagger-ui 에서 API를 직접 호출해 볼 수 있다. 오른쪽 위 Authorize에 로그인 토큰을 넣는다. */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI macoOpenApi() {
        return new OpenAPI()
                .info(new Info().title("MACO API").version("v1").description("매일 10분 마케팅 트레이닝"))
                .components(new Components().addSecuritySchemes("bearer",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearer"));
    }
}
