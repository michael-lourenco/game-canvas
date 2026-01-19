export enum AchievementType {
    KILL_COUNT = 'kill_count',
    SURVIVAL_TIME = 'survival_time',
    LEVEL_REACHED = 'level_reached',
    SCORE_REACHED = 'score_reached',
    BOSS_KILL = 'boss_kill',
    FIRST_WIN = 'first_win',
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    type: AchievementType;
    requirement: number;        // Valor necessário (ex: 100 kills, 120 segundos)
    reward: number;             // Diamonds ganhos
    unlocked: boolean;
}

export const achievements: Achievement[] = [
    {
        id: 'ach_kill_100',
        name: 'Assassino',
        description: 'Mate 100 inimigos',
        type: AchievementType.KILL_COUNT,
        requirement: 100,
        reward: 1,
        unlocked: false,
    },
    {
        id: 'ach_kill_500',
        name: 'Carniceiro',
        description: 'Mate 500 inimigos',
        type: AchievementType.KILL_COUNT,
        requirement: 500,
        reward: 3,
        unlocked: false,
    },
    {
        id: 'ach_survive_120',
        name: 'Sobrevivente',
        description: 'Sobreviva 2 minutos',
        type: AchievementType.SURVIVAL_TIME,
        requirement: 120, // 2 minutos em segundos
        reward: 1,
        unlocked: false,
    },
    {
        id: 'ach_survive_300',
        name: 'Veterano',
        description: 'Sobreviva 5 minutos',
        type: AchievementType.SURVIVAL_TIME,
        requirement: 300, // 5 minutos
        reward: 5,
        unlocked: false,
    },
    {
        id: 'ach_level_10',
        name: 'Aprendiz',
        description: 'Alcance o nível 10',
        type: AchievementType.LEVEL_REACHED,
        requirement: 10,
        reward: 2,
        unlocked: false,
    },
    {
        id: 'ach_level_20',
        name: 'Mestre',
        description: 'Alcance o nível 20',
        type: AchievementType.LEVEL_REACHED,
        requirement: 20,
        reward: 5,
        unlocked: false,
    },
];
