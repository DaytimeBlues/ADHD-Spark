import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import useReducedMotion from '../../hooks/useReducedMotion';
import { getCurrentNightAwePalette } from '../../theme/nightAwe/timeOfDay';
import { isWeb } from '../../utils/PlatformUtils';
import {
  getNightAweTransitionTargets,
  NIGHT_AWE_CONSTELLATION_EDGES,
  NIGHT_AWE_CONSTELLATION_NODES,
  NightAweFeatureKey,
} from './nightAweConstellation';

type NightAweSurfaceVariant = 'home' | 'focus';
type NightAweMotionMode = 'idle' | 'transition';

type WebStyle = ViewStyle & {
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundSize?: string;
};

export interface NightAweBackgroundProps {
  children: React.ReactNode;
  variant?: NightAweSurfaceVariant;
  activeFeature?: NightAweFeatureKey;
  motionMode?: NightAweMotionMode;
  dimmer?: boolean;
  showConstellation?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const STAR_LAYOUT = [
  { top: '12%', left: '10%', size: 2.2, opacity: 0.75 },
  { top: '14%', left: '22%', size: 1.8, opacity: 0.58 },
  { top: '10%', left: '38%', size: 1.6, opacity: 0.48 },
  { top: '18%', left: '52%', size: 2.4, opacity: 0.82 },
  { top: '12%', left: '70%', size: 1.7, opacity: 0.46 },
  { top: '16%', left: '84%', size: 2, opacity: 0.66 },
  { top: '24%', left: '16%', size: 1.5, opacity: 0.42 },
  { top: '22%', left: '30%', size: 1.8, opacity: 0.56 },
  { top: '28%', left: '44%', size: 1.6, opacity: 0.38 },
  { top: '24%', left: '64%', size: 1.9, opacity: 0.52 },
  { top: '30%', left: '78%', size: 1.4, opacity: 0.34 },
  { top: '34%', left: '90%', size: 1.8, opacity: 0.44 },
] as const;

const CONSTELLATION_WIDTH = 320;
const CONSTELLATION_HEIGHT = 220;

function buildSkyBackground(colors: readonly [string, string, string]): string {
  return `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 56%, ${colors[2]} 100%)`;
}

export const NightAweBackground = memo(function NightAweBackground({
  children,
  variant = 'home',
  activeFeature = 'home',
  motionMode = 'idle',
  dimmer = false,
  showConstellation = true,
  style,
  testID,
}: NightAweBackgroundProps) {
  const [palette, setPalette] = useState(() => getCurrentNightAwePalette());
  const reduceMotion = useReducedMotion();
  const activePulse = useRef(new Animated.Value(1)).current;
  const activeEdgeOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setPalette(getCurrentNightAwePalette());
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (reduceMotion || motionMode !== 'transition') {
      activePulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(activePulse, {
          toValue: 1.08,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(activePulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [activePulse, motionMode, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || motionMode !== 'transition') {
      activeEdgeOpacity.setValue(0.3);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(activeEdgeOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(activeEdgeOpacity, {
          toValue: 0.3,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [activeEdgeOpacity, motionMode, reduceMotion]);

  const webSkyStyle = useMemo((): WebStyle | null => {
    if (!isWeb) {
      return null;
    }

    return {
      backgroundImage: buildSkyBackground(palette.sky),
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    };
  }, [palette.sky]);

  const starOpacity =
    palette.phase === 'day'
      ? 0
      : palette.phase === 'sunrise' || palette.phase === 'sunset'
        ? 0.35
        : 1;

  const shellTint =
    variant === 'focus' ? 'rgba(8, 17, 30, 0.2)' : 'rgba(8, 17, 30, 0.08)';
  const transitionTargets = useMemo(
    () => getNightAweTransitionTargets(activeFeature),
    [activeFeature],
  );

  return (
    <View
      testID={testID}
      style={[
        styles.root,
        { backgroundColor: palette.sky[0] },
        webSkyStyle,
        style,
      ]}
    >
      <View style={[styles.atmosphere, { backgroundColor: shellTint }]} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.starField,
          { opacity: starOpacity },
        ]}
      >
        {STAR_LAYOUT.map((star, index) => (
          <View
            key={`${star.top}-${star.left}-${index}`}
            style={[
              styles.star,
              {
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: star.opacity,
                backgroundColor:
                  index % 3 === 0 ? palette.stars.warm : palette.stars.bright,
              },
            ]}
          />
        ))}
      </Animated.View>

      {showConstellation ? (
        <View pointerEvents="none" style={styles.constellationWrap}>
          <View
            style={[
              styles.constellation,
              variant === 'focus'
                ? styles.constellationFocus
                : styles.constellationHome,
            ]}
          >
            {NIGHT_AWE_CONSTELLATION_EDGES.map(([fromId, toId]) => {
              const fromNode = NIGHT_AWE_CONSTELLATION_NODES.find(
                (node) => node.id === fromId,
              );
              const toNode = NIGHT_AWE_CONSTELLATION_NODES.find(
                (node) => node.id === toId,
              );

              if (!fromNode || !toNode) {
                return null;
              }

              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const lineWidth =
                (Math.sqrt(dx * dx + dy * dy) / 100) * CONSTELLATION_WIDTH;
              const angle = `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`;
              const edgeId = `${fromId}-${toId}`;
              const isActiveEdge =
                motionMode === 'transition' &&
                transitionTargets.activeEdgeIds.includes(edgeId);

              const line = (
                <View
                  style={[
                    styles.constellationLine,
                    {
                      left: `${fromNode.x}%`,
                      top: `${fromNode.y}%`,
                      width: lineWidth,
                      transform: [{ rotate: angle }],
                      backgroundColor: isActiveEdge
                        ? palette.constellation.active
                        : palette.constellation.line,
                      opacity: isActiveEdge ? 1 : 0.72,
                    },
                    isWeb
                      ? ({ transformOrigin: 'left center' } as ViewStyle)
                      : null,
                  ]}
                />
              );

              if (!isActiveEdge || reduceMotion) {
                return <React.Fragment key={edgeId}>{line}</React.Fragment>;
              }

              return (
                <Animated.View key={edgeId} style={{ opacity: activeEdgeOpacity }}>
                  {line}
                </Animated.View>
              );
            })}

            {NIGHT_AWE_CONSTELLATION_NODES.map((node) => {
              const isActive = node.id === activeFeature;
              const isConnected =
                motionMode === 'transition' &&
                transitionTargets.connectedNodeIds.includes(node.id);
              const baseNode = (
                <View
                  style={[
                    styles.constellationNode,
                    {
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      backgroundColor: isActive
                        ? palette.features[activeFeature]
                        : palette.constellation.node,
                      borderColor: isActive
                        ? palette.constellation.glow
                        : isConnected
                          ? palette.constellation.line
                          : 'rgba(217, 228, 242, 0.08)',
                      opacity: isConnected ? 0.92 : 1,
                    },
                    isActive
                      ? styles.constellationNodeActive
                      : isConnected
                        ? styles.constellationNodeConnected
                        : null,
                  ]}
                />
              );

              if (!isActive || reduceMotion || motionMode === 'idle') {
                return <React.Fragment key={node.id}>{baseNode}</React.Fragment>;
              }

              return (
                <Animated.View
                  key={node.id}
                  style={{ transform: [{ scale: activePulse }] }}
                >
                  {baseNode}
                </Animated.View>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.horizonWrap} pointerEvents="none">
        <View
          style={[
            styles.horizonFar,
            { backgroundColor: palette.horizon.far, opacity: 0.55 },
          ]}
        />
        <View
          style={[
            styles.horizonMain,
            { backgroundColor: palette.horizon.base, opacity: 0.92 },
          ]}
        />
        <View
          style={[
            styles.horizonFace,
            { backgroundColor: palette.horizon.face, opacity: 0.9 },
          ]}
        />
        <View
          style={[
            styles.horizonRim,
            { backgroundColor: palette.horizon.rim, opacity: 0.22 },
          ]}
        />
      </View>

      {children}

      {dimmer ? (
        <View
          pointerEvents="none"
          style={[styles.dimmer, { backgroundColor: 'rgba(8, 17, 30, 0.24)' }]}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
  },
  constellationWrap: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  constellation: {
    width: CONSTELLATION_WIDTH,
    height: CONSTELLATION_HEIGHT,
    opacity: 0.95,
  },
  constellationHome: {
    marginTop: 12,
  },
  constellationFocus: {
    marginTop: 0,
    opacity: 0.58,
  },
  constellationLine: {
    position: 'absolute',
    height: 1,
  },
  constellationNode: {
    position: 'absolute',
    width: 8,
    height: 8,
    marginLeft: -4,
    marginTop: -4,
    borderRadius: 4,
    borderWidth: 1,
  },
  constellationNodeActive: {
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
  },
  constellationNodeConnected: {
    width: 9,
    height: 9,
    marginLeft: -4.5,
    marginTop: -4.5,
  },
  horizonWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    justifyContent: 'flex-end',
  },
  horizonFar: {
    position: 'absolute',
    left: '-4%',
    right: '-4%',
    bottom: '26%',
    height: '28%',
    borderTopLeftRadius: 220,
    borderTopRightRadius: 260,
    transform: [{ scaleX: 1.04 }],
  },
  horizonMain: {
    position: 'absolute',
    left: '-8%',
    right: '-8%',
    bottom: 0,
    height: '54%',
    borderTopLeftRadius: 260,
    borderTopRightRadius: 320,
  },
  horizonFace: {
    position: 'absolute',
    width: '46%',
    height: '42%',
    bottom: '12%',
    left: '26%',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 120,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 20,
  },
  horizonRim: {
    position: 'absolute',
    width: '38%',
    height: '6%',
    bottom: '51%',
    left: '30%',
    borderRadius: 24,
  },
  dimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default NightAweBackground;
