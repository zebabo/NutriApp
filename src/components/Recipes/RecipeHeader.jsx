/**
 * 📋 RECIPE HEADER
 * Header do detalhe da receita
 */

import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export const RecipeHeader = ({ imageUrl, onBack, onShare, onToggleFavorite, isFavorite }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      
      {/* Gradient overlay */}
      <View style={styles.overlay} />

      {/* Botões */}
      <View style={styles.buttonsContainer}>
        {/* Voltar */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Share e Favorito */}
        <View style={styles.rightButtons}>
          {/* Share */}
          {onShare && (
            <TouchableOpacity 
              style={styles.button} 
              onPress={onShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="share-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          )}

          {/* Favorito */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={onToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#FF4444' : '#FFF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  buttonsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 50,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});