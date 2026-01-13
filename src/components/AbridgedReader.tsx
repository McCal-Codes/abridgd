import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RotateCcw, Undo2 } from 'lucide-react-native';
import { parse } from 'node-html-parser';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import Slider from '@react-native-community/slider';
import { useSettings } from '../context/SettingsContext';

interface AbridgedReaderProps {
  content?: string;
}

export const AbridgedReader: React.FC<AbridgedReaderProps> = ({ content = "" }) => {
  const { rsvpHighlightColor, rsvpAnchorStrategy } = useSettings();
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!content) {
        setWords([]);
        return;
    }

    // Parse HTML to properly handle structure
    const root = parse(content);
    
    // 1. Remove obvious caption/meta tags
    root.querySelectorAll('figcaption, cite, script, style, .caption, .credit').forEach(el => el.remove());
    
    // 2. Extract text from block elements
    const blocks = root.querySelectorAll('p, h1, h2, h3, h4, li');
    const textParts: string[] = [];
    
    blocks.forEach(block => {
        const text = block.text.trim();
        if (!text) return;
        
        // 3. Heuristic to skip photo credits
        const isCredit = text.startsWith('Photo:') || 
                         text.startsWith('Credit:') || 
                         (text.length < 70 && (
                             text.toLowerCase().includes('photo by') || 
                             text.toLowerCase().includes('image via') || 
                             text.toLowerCase().includes('copyright') ||
                             text.includes('©')
                         ));
        
        if (!isCredit) {
            textParts.push(text);
        }
    });

    // Fallback for non-structured HTML
    const finalContent = textParts.length > 0 ? textParts.join(' ') : root.text;
        
    const wordArray = finalContent.split(/\s+/).filter(w => w.length > 0);
    setWords(wordArray);
    setCurrentIndex(0);
  }, [content]);

  useEffect(() => {
    if (isPlaying) {
      const msPerWord = 60000 / wpm;
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, msPerWord);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, wpm, words.length]);

  const currentWord = words[currentIndex] || "Ready";
  
  // Calculate pivot based on strategy
  let pivotIndex = 0;
  const len = currentWord.length;

  if (rsvpAnchorStrategy === 'center') {
      pivotIndex = Math.floor(len / 2);
  } else if (rsvpAnchorStrategy === 'early') {
      pivotIndex = len > 1 ? Math.floor(len * 0.2) : 0; // closer to start
  } else {
      // Standard / ORP (Optical Recognition Point) is usually around 35%
      pivotIndex = Math.ceil((len - 1) / 4);
  }

  // Safety bounds
  if (pivotIndex < 0) pivotIndex = 0;
  if (pivotIndex >= len) pivotIndex = len - 1;

  const leftPart = currentWord.slice(0, pivotIndex);
  const pivotChar = currentWord[pivotIndex] || "";
  const rightPart = currentWord.slice(pivotIndex + 1);

  return (
    <View style={styles.container}>
      {/* Reader Word Display */}
      <View style={styles.wordDisplay}>
        <View style={styles.guideLines}>
           <View style={styles.topGuide} />
           <View style={styles.bottomGuide} />
        </View>
        <View style={styles.wordRow}>
            <View style={styles.leftContainer}>
                <Text style={styles.wordText} numberOfLines={1} ellipsizeMode="clip">{leftPart}</Text>
            </View>
            <View style={styles.pivotContainer}>
                <Text style={[styles.wordText, styles.wordPivot, { color: rsvpHighlightColor }]} numberOfLines={1}>{pivotChar}</Text>
            </View>
            <View style={styles.rightContainer}>
                <Text style={styles.wordText} numberOfLines={1} ellipsizeMode="clip">{rightPart}</Text>
            </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(currentIndex / words.length) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{currentIndex} / {words.length} words</Text>

      {/* Controls */}
      <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setCurrentIndex(Math.max(0, currentIndex - 10))}>
             <View style={styles.iconButtonContent}>
                <RotateCcw size={16} color={colors.text} strokeWidth={2.5} />
                <Text style={styles.controlText}>10</Text>
             </View>
          </TouchableOpacity>
         
         <TouchableOpacity 
            style={[styles.playButton, isPlaying ? styles.pauseBtn : styles.playBtn]} 
            onPress={() => setIsPlaying(!isPlaying)}>
            <Text style={styles.playButtonText}>{isPlaying ? 'PAUSE' : 'READ'}</Text>
         </TouchableOpacity>
         
         <TouchableOpacity style={styles.controlBtn} onPress={() => setCurrentIndex(0)}>
            <Undo2 size={20} color={colors.text} strokeWidth={2.5} />
         </TouchableOpacity>
      </View>

      {/* Speed Control */}
      <View style={styles.speedControl}>
         <Text style={styles.speedLabel}>SPEED: {wpm} WPM</Text>
         <Slider
            style={{width: 200, height: 40}}
            minimumValue={100}
            maximumValue={800}
            step={25}
            value={wpm}
            onValueChange={setWpm}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
         />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordDisplay: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden', 
  },
  guideLines: {
     position: 'absolute',
     top: 0, left: 0, right: 0, bottom: 0,
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: 0,
  },
  topGuide: {
      width: 2,
      height: 12,
      backgroundColor: colors.text,
      marginBottom: 42,
  },
  bottomGuide: {
      width: 2,
      height: 12,
      backgroundColor: colors.text,
      marginTop: 42,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline', 
    width: '100%',
    zIndex: 1,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  pivotContainer: {
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontFamily: typography.fontFamily.mono, 
    fontSize: 36, // Reduced from 42 to help prevent wrapping on long words
    fontWeight: '400',
    color: colors.text,
  },
  wordPivot: { 
    fontWeight: '700' 
  }, 
  
  progressContainer: {
      width: '100%',
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: spacing.xs,
  },
  progressBar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
  },
  progressText: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
  },
  controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      marginBottom: spacing.lg,
  },
  controlBtn: {
      padding: spacing.sm,
  },
  controlText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 12,
  },
  iconButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  playButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 50,
      minWidth: 120,
      alignItems: 'center',
  },
  playBtn: { backgroundColor: colors.primary },
  pauseBtn: { backgroundColor: colors.text },
  playButtonText: {
      color: colors.surface,
      fontWeight: '800',
      letterSpacing: 1,
  },
  speedControl: {
      alignItems: 'center',
      width: '100%',
  },
  speedLabel: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
  },
});
