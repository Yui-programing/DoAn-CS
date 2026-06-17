import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { mediaService } from '../services/mediaService';
import { useAuth } from './AuthContext';

interface FavoriteContextType {
    favoriteIds: string[];
    toggleFavorite: (mediaItemId: string) => Promise<void>;
    isFavorite: (mediaItemId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchFavorites = async () => {
                try {
                    const response = await mediaService.getFavorites();
                    if (response.success && response.data) {
                        setFavoriteIds(response.data.map(f => f.mediaItemId));
                    }
                } catch (error) {
                    console.error("Lỗi khi tải danh sách yêu thích:", error);
                }
            };
            fetchFavorites();
        } else {
            setFavoriteIds([]);
        }
    }, [isAuthenticated]);

    const toggleFavorite = async (mediaItemId: string) => {
        if (!isAuthenticated) {
            alert("Vui lòng đăng nhập để thả tim bài hát!");
            return;
        }

        const isFav = favoriteIds.includes(mediaItemId);

        // Optimistic UI update
        if (isFav) {
            setFavoriteIds(prev => prev.filter(id => id !== mediaItemId));
        } else {
            setFavoriteIds(prev => [...prev, mediaItemId]);
        }

        try {
            if (isFav) {
                await mediaService.removeFavorite(mediaItemId);
            } else {
                await mediaService.addFavorite(mediaItemId);
            }
        } catch (error) {
            // Revert on error
            if (isFav) {
                setFavoriteIds(prev => [...prev, mediaItemId]);
            } else {
                setFavoriteIds(prev => prev.filter(id => id !== mediaItemId));
            }
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
            console.error(error);
        }
    };

    const isFavorite = (mediaItemId: string) => {
        return favoriteIds.includes(mediaItemId);
    };

    return (
        <FavoriteContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorite = () => {
    const context = useContext(FavoriteContext);
    if (context === undefined) {
        throw new Error('useFavorite must be used within a FavoriteProvider');
    }
    return context;
};
