import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { X, Send, SmilePlus } from 'lucide-react-native';

const ModalChat = ({
  isOpenChat,
  selectedNegotiationChat,
  currentRoleChat,
  messagesChat,
  messageChat,
  emojiList,
  setShowEmojiPickerChat,
  showEmojiPickerChat,
  handleEmojiSelect,
  loadingMessagesChat,
  sendingChat,
  errorChat,
  flatListRef,
  closeChatModal,
  handleMessageChange,
  handleSendMessage,
}) => {
  if (!isOpenChat) return null;

  const getSenderInfo = (role) => {
    if (role === 'client') {
      return {
        name: selectedNegotiationChat?.client?.nome?.split(' ')[0] || 'Cliente',
        title: 'cliente',
      };
    }

    if (role === 'traveler') {
      return {
        name: selectedNegotiationChat?.traveler?.nome?.split(' ')[0] || 'Viajante',
        title: 'viajante',
      };
    }

    if (role === 'receiver') {
      return {
        name:
          selectedNegotiationChat?.receiver?.nome?.split(' ')[0] ||
          'Destinatário',
        title: 'destinatário',
      };
    }

    return {
      name: 'Usuário',
      title: 'participante',
    };
  };

  const renderMessageItem = ({ item }) => {
    const role = String(item.who_send_message || '').toLowerCase();
    const sender = getSenderInfo(role);
    const isMine = role === currentRoleChat;

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageMineRow : styles.messageOtherRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.messageMineBubble : styles.messageOtherBubble,
          ]}
        >
          <Text
            style={[
              styles.authorText,
              role === 'client' && styles.roleClient,
              role === 'traveler' && styles.roleTraveler,
              role === 'receiver' && styles.roleReceiver,
            ]}
          >
            {sender.name} ⦿ {sender.title}
          </Text>

          <Text style={styles.messageText}>{item.message}</Text>

          <Text style={styles.timeText}>
            {new Date(item.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isOpenChat}
      animationType="slide"
      transparent={true}
      onRequestClose={closeChatModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={closeChatModal}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Chat</Text>
              <Text style={styles.headerSubtitle}>
                {selectedNegotiationChat?.trip?.cidade_origem || 'Origem'} →{' '}
                {selectedNegotiationChat?.trip?.cidade_destino || 'Destino'}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={closeChatModal}>
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Participantes */}
          <View style={styles.participantsStrip}>
            <Text style={styles.participantsTitle}>Participantes</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.participantsRow}
            >
              {/* Cliente */}
              <View style={styles.participantChip}>
                <Image
                  source={{
                    uri:
                      selectedNegotiationChat?.client?.imagem ||
                      'https://i.pravatar.cc/100',
                  }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.participantName}>
                    {selectedNegotiationChat?.client?.nome?.split(' ')[0] ||
                      'Cliente'}
                  </Text>
                  <Text style={styles.participantRole}>Cliente</Text>
                </View>
              </View>

              {/* Viajante */}
              <View style={styles.participantChip}>
                <Image
                  source={{
                    uri:
                      selectedNegotiationChat?.traveler?.imagem ||
                      'https://i.pravatar.cc/100',
                  }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.participantName}>
                    {selectedNegotiationChat?.traveler?.nome?.split(' ')[0] ||
                      'Viajante'}
                  </Text>
                  <Text style={styles.participantRole}>Viajante</Text>
                </View>
              </View>

              {/* Destinatário */}
              {selectedNegotiationChat?.receiver &&
                selectedNegotiationChat?.is_receiver_data_confirmed === true && (
                  <View style={styles.participantChip}>
                    <Image
                      source={{
                        uri:
                          selectedNegotiationChat?.receiver?.imagem ||
                          'https://i.pravatar.cc/100',
                      }}
                      style={styles.avatar}
                    />
                    <View>
                      <Text style={styles.participantName}>
                        {selectedNegotiationChat?.receiver?.nome?.split(' ')[0] ||
                          'Destinatário'}
                      </Text>
                      <Text style={styles.participantRole}>Destinatário</Text>
                    </View>
                  </View>
                )}
            </ScrollView>
          </View>

          {/* Corpo do Chat / Lista de Mensagens */}
          {loadingMessagesChat ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#00B4D8" />
              <Text style={styles.emptyText}>Carregando mensagens...</Text>
            </View>
          ) : messagesChat.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                Ainda não existem mensagens nesta conversa.
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messagesChat}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
          )}

          {Boolean(errorChat) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorChat}</Text>
            </View>
          )}

          {/* Picker de Emojis */}
          {showEmojiPickerChat && (
            <View style={styles.emojiPicker}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {emojiList.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.emojiItem}
                    onPress={() => handleEmojiSelect(emoji)}
                  >
                    <Text style={{ fontSize: 22 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input e Ações */}
          <View style={styles.inputArea}>
            <TouchableOpacity
              style={styles.emojiBtn}
              onPress={() => setShowEmojiPickerChat((prev) => !prev)}
            >
              <SmilePlus size={22} color="#6B7280" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Escreva a sua mensagem..."
              placeholderTextColor="#9CA3AF"
              value={messageChat}
              onChangeText={handleMessageChange}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!messageChat.trim() || sendingChat) && styles.sendBtnDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!messageChat.trim() || sendingChat}
            >
              {sendingChat ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Send size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    height: '85%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  participantsStrip: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  participantsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  participantsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  participantName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  participantRole: {
    fontSize: 10,
    color: '#6B7280',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  messagesList: {
    paddingVertical: 12,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  messageMineRow: {
    justifyContent: 'flex-end',
  },
  messageOtherRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageMineBubble: {
    backgroundColor: '#00B4D8',
    borderBottomRightRadius: 2,
  },
  messageOtherBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 2,
  },
  authorText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    color: '#4B5563',
  },
  roleClient: { color: '#2563EB' },
  roleTraveler: { color: '#059669' },
  roleReceiver: { color: '#D97706' },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
  },
  emojiPicker: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  emojiItem: {
    paddingHorizontal: 8,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  emojiBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    backgroundColor: '#00B4D8',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
});

export default ModalChat;