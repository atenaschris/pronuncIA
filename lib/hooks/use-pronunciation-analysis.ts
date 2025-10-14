import { useMutation } from '@tanstack/react-query';

interface AnalyzeArgs {
    uri: string;
    targetWord: string;
    locale: string;
    mode?: 'word' | 'sentence';
}

// React Query mutation to analyze pronunciation via backend Azure Speech API
export function usePronunciationAnalysis() {
    const API_BASE_URL = process.env.EXPO_PUBLIC_PRONUN_API_BASE_URL || 'http://192.168.1.100:3001';

    return useMutation({
        mutationKey: ['pronunciation', 'analyze'],
        mutationFn: async ({ uri, targetWord, locale, mode = 'word' }: AnalyzeArgs) => {
            const formData = new FormData();
            formData.append('audio', {
                uri,
                type: 'audio/m4a',
                name: 'recording.m4a',
            } as any);
            formData.append('targetWord', targetWord);
            formData.append('locale', locale);
            formData.append('mode', mode);

            const res = await fetch(`${API_BASE_URL}/api/pronunciation/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                let detail: any = null;
                try { detail = await res.json(); } catch { }
                throw new Error(`HTTP ${res.status}${detail?.message ? `: ${detail.message}` : ''}`);
            }

            return res.json();
        },
    });
}