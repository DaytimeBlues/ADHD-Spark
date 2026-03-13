import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { CosmicBackground, GlowCard, RuneButton } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
import ChatService, { ChatMessage } from '../services/ChatService';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import type { ThemeTokens } from '../theme/types';
import { isIOS } from '../utils/PlatformUtils';

const ChatScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { isCosmic, isNightAwe, variant, t } = useTheme();

  useEffect(() => {
    return ChatService.subscribe((msgs) => {
      setMessages(msgs.filter((m) => m.role !== 'system'));
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) {
      return;
    }
    const text = inputText;
    setInputText('');
    await ChatService.sendMessage(text);
  };

  const styles = getStyles(variant, t);

  const content = (
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={isIOS ? 90 : 0}
      accessibilityLabel="Chat screen"
      accessibilityRole="summary"
    >
      <View style={styles.header}>
        <Text style={styles.title}>CADDI_ASSISTANT</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.role === 'user' ? styles.userRow : styles.assistantRow,
            ]}
          >
            <GlowCard
              glow={msg.role === 'assistant' ? 'soft' : 'none'}
              padding="sm"
              style={[
                styles.bubble,
                msg.role === 'user'
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
            </GlowCard>
          </View>
        ))}
        {messages.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              HOW CAN I HELP YOU FOCUS TODAY?
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="TYPE_YOUR_THOUGHTS..."
          placeholderTextColor={
            t.colors.text?.placeholder || Tokens.colors.text.placeholder
          }
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          multiline
        />
        <RuneButton
          variant={isNightAwe ? 'secondary' : 'primary'}
          size="sm"
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          SEND
        </RuneButton>
      </View>
    </KeyboardAvoidingView>
  );

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="focus"
        activeFeature="chat"
        motionMode="idle"
      >
        {content}
      </NightAweBackground>
    );
  }

  if (isCosmic) {
    return <CosmicBackground variant="nebula">{content}</CosmicBackground>;
  }

  return content;
};

const getStyles = (variant: 'linear' | 'cosmic' | 'nightAwe', t: ThemeTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: Tokens.spacing[4],
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor:
        variant === 'nightAwe'
          ? 'rgba(175, 199, 255, 0.16)'
          : variant === 'cosmic'
            ? 'rgba(139, 92, 246, 0.2)'
            : Tokens.colors.neutral.borderSubtle,
    },
    title: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      fontWeight: '700',
      color:
        variant === 'nightAwe'
          ? t.colors.nightAwe?.feature?.chat || '#AFC7FF'
          : variant === 'cosmic'
            ? '#8B5CF6'
            : Tokens.colors.brand[500],
      letterSpacing: 2,
    },
    messageList: {
      flex: 1,
    },
    messageContent: {
      padding: Tokens.spacing[4],
      paddingBottom: Tokens.spacing[8],
    },
    messageRow: {
      marginBottom: Tokens.spacing[4],
      maxWidth: '85%',
    },
    userRow: {
      alignSelf: 'flex-end',
    },
    assistantRow: {
      alignSelf: 'flex-start',
    },
    bubble: {
      borderRadius: 12,
    },
    userBubble: {
      backgroundColor:
        variant === 'nightAwe'
          ? 'rgba(175, 199, 255, 0.16)'
          : variant === 'cosmic'
            ? 'rgba(139, 92, 246, 0.2)'
            : Tokens.colors.brand[900],
      borderBottomRightRadius: 2,
    },
    assistantBubble: {
      backgroundColor:
        variant === 'nightAwe'
          ? '#16283F'
          : variant === 'cosmic'
            ? '#0B1022'
            : Tokens.colors.neutral.darker,
      borderBottomLeftRadius: 2,
    },
    messageText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.sm,
      color:
        variant === 'nightAwe'
          ? t.colors.text?.primary || '#F6F1E7'
          : variant === 'cosmic'
            ? '#EEF2FF'
            : Tokens.colors.text.primary,
      lineHeight: 20,
    },
    emptyContainer: {
      paddingVertical: 100,
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color:
        variant === 'nightAwe'
          ? t.colors.text?.secondary || '#C9D5E8'
          : variant === 'cosmic'
            ? '#B9C2D9'
            : Tokens.colors.text.tertiary,
      opacity: 0.5,
    },
    inputArea: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: Tokens.spacing[4],
      backgroundColor:
        variant === 'nightAwe'
          ? 'rgba(8, 17, 30, 0.86)'
          : variant === 'cosmic'
            ? 'rgba(7, 7, 18, 0.9)'
            : Tokens.colors.neutral.darkest,
      borderTopWidth: 1,
      borderTopColor:
        variant === 'nightAwe'
          ? 'rgba(175, 199, 255, 0.16)'
          : variant === 'cosmic'
            ? 'rgba(139, 92, 246, 0.2)'
            : Tokens.colors.neutral.borderSubtle,
      gap: Tokens.spacing[3],
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      backgroundColor:
        variant === 'nightAwe'
          ? '#16283F'
          : variant === 'cosmic'
            ? 'rgba(11, 16, 34, 0.8)'
            : Tokens.colors.neutral.darker,
      borderRadius: 22,
      paddingHorizontal: Tokens.spacing[4],
      paddingVertical: Tokens.spacing[3],
      color:
        variant === 'nightAwe'
          ? t.colors.text?.primary || '#F6F1E7'
          : variant === 'cosmic'
            ? '#EEF2FF'
            : Tokens.colors.text.primary,
      fontFamily: t.type?.fontFamily?.sans ?? Tokens.type.fontFamily.sans,
      fontSize: t.type?.sm ?? Tokens.type.sm,
    },
  });

export default ChatScreen;
