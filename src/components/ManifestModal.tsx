import React, { useState } from 'react';
import { FileCode, X, Copy, Check } from 'lucide-react';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface ManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManifestModal: React.FC<ManifestModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useAppSettings();
  const [activeTab, setActiveTab] = useState<'docker' | 'k8s' | 'hpa'>('docker');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const DOCKERFILE_CODE =
    language === 'es'
      ? `# ==============================================================
# ETAPA 1: Compilación de la aplicación Spring Boot 3.2 con Maven
# ==============================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Caché de capas de dependencias Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compilación y empaquetado del artefacto JAR
COPY src src
RUN mvn clean package -DskipTests

# ==============================================================
# ETAPA 2: Imagen de ejecución ligera con Eclipse Temurin JRE Alpine
# ==============================================================
FROM eclipse-temurin:21-jre-alpine
LABEL maintainer="Christian Camilo Sandoval Vega <sandoval.research@teinco.edu.co>"
LABEL research="Metodologias Agiles + Frameworks Modernos"

# Creación de usuario sin privilegios root para seguridad en K8s
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copia del binario JAR inmutable desde la etapa constructora
COPY --from=builder /workspace/target/*.jar app.jar
USER appuser:appgroup

# Puerto de exposición y configuración de memoria de la JVM
EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]`
      : `# ==============================================================
# STAGE 1: Build the Spring Boot 3.2 application with Maven
# ==============================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache Maven dependency layers
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package the JAR artifact
COPY src src
RUN mvn clean package -DskipTests

# ==============================================================
# STAGE 2: Lightweight runtime image with Eclipse Temurin JRE Alpine
# ==============================================================
FROM eclipse-temurin:21-jre-alpine
LABEL maintainer="Christian Camilo Sandoval Vega <sandoval.research@teinco.edu.co>"
LABEL research="Agile Methodologies + Modern Frameworks"

# Create non-root user for Kubernetes security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy immutable JAR binary from builder stage
COPY --from=builder /workspace/target/*.jar app.jar
USER appuser:appgroup

# Exposed port and JVM memory configuration
EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]`;

  const K8S_DEPLOYMENT_CODE = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: metrics-service
  namespace: production-devagile
  labels:
    app: metrics-service
    tier: backend
    version: v3.1
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: metrics-service
  template:
    metadata:
      labels:
        app: metrics-service
        tier: backend
    spec:
      containers:
      - name: metrics-service
        image: sandoval/metrics-service:v3.1-alpine
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8082
          name: http
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1024Mi"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8082
          initialDelaySeconds: 20
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8082
          initialDelaySeconds: 15
          periodSeconds: 5
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s-prod"
        - name: REDIS_HOST
          value: "redis-cluster.production-devagile.svc.cluster.local"`;

  const K8S_HPA_CODE = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: metrics-service-hpa
  namespace: production-devagile
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: metrics-service
  minReplicas: 3
  maxReplicas: 12
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 20
        periodSeconds: 60`;

  const currentCode =
    activeTab === 'docker'
      ? DOCKERFILE_CODE
      : activeTab === 'k8s'
      ? K8S_DEPLOYMENT_CODE
      : K8S_HPA_CODE;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 dark:bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t.manifestModal.title}</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{t.manifestModal.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-100/70 dark:bg-zinc-950/60 gap-2 flex-wrap">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('docker')}
              className={`px-3 py-1.5 rounded-t-lg font-mono text-xs font-semibold border-t border-x transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'docker'
                  ? 'bg-zinc-900 text-teal-400 border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent'
              }`}
            >
              {t.manifestModal.dockerTab}
            </button>
            <button
              onClick={() => setActiveTab('k8s')}
              className={`px-3 py-1.5 rounded-t-lg font-mono text-xs font-semibold border-t border-x transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'k8s'
                  ? 'bg-zinc-900 text-teal-400 border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent'
              }`}
            >
              deployment-metrics-service.yaml
            </button>
            <button
              onClick={() => setActiveTab('hpa')}
              className={`px-3 py-1.5 rounded-t-lg font-mono text-xs font-semibold border-t border-x transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'hpa'
                  ? 'bg-zinc-900 text-teal-400 border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent'
              }`}
            >
              hpa-autoscaler.yaml
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-xs font-mono mb-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.common.copied : t.manifestModal.copyBtn}</span>
          </button>
        </div>

        {/* Code View */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar font-mono text-xs bg-zinc-900 dark:bg-zinc-950">
          <pre className="text-zinc-300 leading-relaxed overflow-x-auto text-[11px] p-2">{currentCode}</pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-2 flex-wrap">
          <span>{t.manifestModal.footerGitops}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
