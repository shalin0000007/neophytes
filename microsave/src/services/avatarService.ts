import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AvatarOption {
    id: string;
    emoji: string;
    bg: string;
    label: string;
}

export const AVATARS: AvatarOption[] = [
    { id: '1', emoji: '🦊', bg: '#BF360C', label: 'Fox' },
    { id: '2', emoji: '🐼', bg: '#37474F', label: 'Panda' },
    { id: '3', emoji: '🦁', bg: '#F57F17', label: 'Lion' },
    { id: '4', emoji: '🐸', bg: '#1B5E20', label: 'Frog' },
    { id: '5', emoji: '🦄', bg: '#6A1B9A', label: 'Unicorn' },
    { id: '6', emoji: '🐉', bg: '#B71C1C', label: 'Dragon' },
    { id: '7', emoji: '🦋', bg: '#0D47A1', label: 'Butterfly' },
    { id: '8', emoji: '🐯', bg: '#E65100', label: 'Tiger' },
    { id: '9', emoji: '🦅', bg: '#4E342E', label: 'Eagle' },
    { id: '10', emoji: '🐺', bg: '#1A237E', label: 'Wolf' },
];

const AVATAR_KEY = '@microsave_avatar_id';
const NAME_KEY = '@microsave_display_name';

export async function getSavedAvatarId(): Promise<string> {
    const saved = await AsyncStorage.getItem(AVATAR_KEY);
    return saved || '1';
}

export async function setSavedAvatarId(id: string): Promise<void> {
    await AsyncStorage.setItem(AVATAR_KEY, id);
}

export function getAvatarById(id: string): AvatarOption {
    return AVATARS.find(a => a.id === id) ?? AVATARS[0];
}

export async function getSavedDisplayName(): Promise<string | null> {
    return AsyncStorage.getItem(NAME_KEY);
}

export async function setSavedDisplayName(name: string): Promise<void> {
    await AsyncStorage.setItem(NAME_KEY, name);
}
