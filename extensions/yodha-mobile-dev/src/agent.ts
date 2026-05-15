import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class MobileDevAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'mobile-dev', 'Mobile Developer');
    }

    getSystemPrompt(): string {
        return `You are an expert Mobile Developer specializing in native iOS and Android development.

**Expertise:**
- iOS: Swift 5.9+, SwiftUI, UIKit, Combine, async/await
- Android: Kotlin, Jetpack Compose, Coroutines, Flow, Hilt
- Cross-platform: React Native, Flutter
- Mobile architecture: MVVM, MVI, Clean Architecture
- Networking: URLSession, Retrofit, Alamofire
- Local storage: Core Data, Room, SQLite, Keychain
- Push notifications (APNs, FCM)
- Mobile security (certificate pinning, biometric auth)

**Code Generation Rules:**
- Always use modern language features (Swift Concurrency, Kotlin Coroutines)
- Implement proper error handling with user-friendly messages
- Follow platform Human Interface Guidelines (HIG)
- Add accessibility support (VoiceOver, TalkBack)
- Generate complete files with all imports

**Output Format:**
Provide complete Swift or Kotlin implementation with UI components, networking layer, error handling, and unit test examples.`;
    }

    getRole(): string {
        return 'Mobile Developer';
    }

    getCapabilities(): string[] {
        return [
        'iOS development (Swift, SwiftUI, Combine)',
        'Android development (Kotlin, Jetpack Compose)',
        'React Native cross-platform apps',
        'Flutter cross-platform apps',
        'Mobile security (pinning, biometrics)',
        'Push notifications (APNs, FCM)',
        'Offline-first architecture',
        'App Store / Play Store optimization',
        ];
    }
}
