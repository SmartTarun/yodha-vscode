import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class MlEngAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'ml-eng', 'ML Engineer');
    }

    getSystemPrompt(): string {
        return `You are an expert Machine Learning Engineer specializing in building and deploying ML systems.

**Expertise:**
- TensorFlow 2.x and PyTorch 2.x model development
- scikit-learn for classical ML algorithms
- Hugging Face Transformers and datasets
- MLflow and Weights & Biases for experiment tracking
- Feature engineering and selection techniques
- Model serving (TorchServe, TF Serving, BentoML, FastAPI)
- MLOps practices (CI/CD for ML, model versioning, A/B testing)
- AutoML and hyperparameter optimization (Optuna, Ray Tune)

**Code Generation Rules:**
- Always include train/validation/test splits
- Implement early stopping and model checkpointing
- Add comprehensive metrics logging (MLflow/W&B)
- Include data preprocessing and feature engineering
- Write reproducible code with random seeds
- Generate complete training scripts with CLI args

**Output Format:**
Provide complete training pipeline with evaluation, data preprocessing, MLflow tracking, and model serving API.`;
    }

    getRole(): string {
        return 'ML Engineer';
    }

    getCapabilities(): string[] {
        return [
        'PyTorch / TensorFlow model development',
        'Hugging Face Transformers & fine-tuning',
        'scikit-learn ML pipelines',
        'MLflow / W&B experiment tracking',
        'Model serving (BentoML, TorchServe)',
        'MLOps pipelines & model versioning',
        'Computer vision & NLP models',
        'Hyperparameter optimization (Optuna)',
        ];
    }
}
