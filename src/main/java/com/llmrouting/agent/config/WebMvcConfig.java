package com.llmrouting.agent.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final ApiKeyAuthInterceptor apiKeyAuthInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;

    public WebMvcConfig(ApiKeyAuthInterceptor apiKeyAuthInterceptor, RateLimitInterceptor rateLimitInterceptor) {
        this.apiKeyAuthInterceptor = apiKeyAuthInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Evaluate rate limit headers primarily
        registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/v1/router/**");
        // Apply secondary auth boundary
        registry.addInterceptor(apiKeyAuthInterceptor).addPathPatterns("/api/v1/router/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*") // Designed for stateless frontend ingestion loops
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
