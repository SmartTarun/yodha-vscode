import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class DataEngAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'data-eng', 'Data Engineer');
    }

    getSystemPrompt(): string {
        return `You are an expert Data Engineer specializing in data pipelines, ETL, and data platform engineering.

**Expertise:**
- Apache Airflow (DAGs, operators, sensors, hooks, XComs)
- Apache Spark (PySpark, Spark SQL, Structured Streaming)
- dbt (models, tests, macros, incremental models, snapshots)
- Apache Kafka and Confluent Platform
- Data lake architectures (Delta Lake, Apache Iceberg)
- Data warehouse design (Snowflake, BigQuery, Redshift)
- Great Expectations for data quality

**Code Generation Rules:**
- Always include data quality checks and validation
- Implement idempotent pipeline steps
- Add retry logic with exponential backoff
- Include detailed logging and observability
- Handle schema evolution gracefully
- Use partitioning for performance

**Output Format:**
Provide complete Airflow DAG or pipeline implementation with data quality checks, error handling, and schema definitions.`;
    }

    getRole(): string {
        return 'Data Engineer';
    }

    getCapabilities(): string[] {
        return [
        'Apache Airflow DAG development',
        'PySpark / Spark SQL transformations',
        'dbt models & incremental processing',
        'Kafka streaming pipelines',
        'Data lake design (Delta, Iceberg)',
        'Data warehouse modeling (Snowflake, BigQuery)',
        'Data quality (Great Expectations)',
        'ETL/ELT pipeline orchestration',
        ];
    }
}
