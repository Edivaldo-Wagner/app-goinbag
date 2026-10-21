// components/Notifications/NotificationsModal.js

import React from 'react';
import {
  Alert,
  Modal,
  TouchableWithoutFeedback,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import UseViagensCliente from '../../hooks/UseViagens/UseViagensCliente';
import UseViagensCarteiro from '../../hooks/UseViagens/UseViagensCarteiro';
import UseViagensDestinatario from '../../hooks/UseViagens/UseViagensDestinatario';

const NotificationsModal = ({
  visible,
  onClose,
  notifications = [],
  loading = false,
  confirmDeleteNotifications,
  setConfirmDeleteNotifications,
  removeNotification,
}) => {
  const navigation = useNavigation();

  const {
    buscarViagensEmNegociacaoCliente,
  } = UseViagensCliente();

  const {
    buscarViagensEmNegociacaoCarteiro,
  } = UseViagensCarteiro(); 

  const {
    buscarViagensEmNegociacaoDestinatario,
  } = UseViagensDestinatario();

  const handleNotificationPress = async item => {
    // onClose();
    if (item.notification_redirect === 'payment-client') {
      const listaAtualizada = await buscarViagensEmNegociacaoCliente();
      
      let itemEncontrado = null;
      const lista = listaAtualizada || [];

      for (const v of lista) {
        if (v?.serie_trip_negotiations === item.serie_trip_negotiations) {
          itemEncontrado = v;
          break;
        }
      }

      const itemNegociacao = itemEncontrado || {
        serie_trip_negotiations: item.serie_trip_negotiations,
      };

      //Alert.alert(
      //  "Item Encontrado", 
      //  JSON.stringify(itemNegociacao, null, 2),
      //  [{ text: "OK" }]
      //);

      //return

      navigation.navigate('PaymentService', {
        item: itemNegociacao,
        notification_type: item.notification_type,
        from: 'notification',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modal}>
              {/* Cabeçalho */}
              <View style={styles.header}>
                <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={['#1a7fe7', '#19c4c9']}
                style={styles.headerGradient}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                <Text style={styles.title}>🔔 Notificações</Text>
                <Text style={styles.subtitle}>
                  Veja as últimas atualizações
                </Text>
                </LinearGradient>
              </View>

              {/* Lista */}
              <ScrollView contentContainerStyle={styles.list}>
                {loading ? (
                  <View style={styles.empty}>
                    <ActivityIndicator size="small" color="#1a7fe7" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                  </View>
                ) : notifications.length === 0 ? (
                  <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>🔕</Text>
                    <Text style={styles.emptyText}>
                      Nenhuma notificação
                    </Text>
                  </View>
                ) : (
                  notifications.map(item => (
                    <View key={item.id} style={styles.item}>
                      <View
                        style={styles.dot}
                      />

                      <View style={styles.itemContent}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleNotificationPress(item)}>
                          <Text style={styles.itemTitle}>
                            {item.title}
                          </Text>

                          <Text style={styles.itemMessage}>
                            {item.message}
                          </Text>

                          <Text style={styles.time}>
                            {item.time}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.actions}>
                          {confirmDeleteNotifications === item.id ? (
                            <View style={styles.confirmRemove}>
                              <Text style={styles.confirmText}>
                                Tem certeza que deseja remover esta
                                notificação?
                              </Text>

                              <View style={styles.confirmButtons}>
                                <TouchableOpacity
                                  style={[
                                    styles.confirmButton,
                                    styles.cancelButton,
                                  ]}
                                  onPress={() =>
                                    setConfirmDeleteNotifications(null)
                                  }>
                                  <Text style={styles.cancelText}>
                                    Cancelar
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[
                                    styles.confirmButton,
                                    styles.deleteButton,
                                  ]}
                                  onPress={() =>
                                    removeNotification(item.id)
                                  }>
                                  <Text style={styles.deleteText}>
                                    Remover
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() =>
                                setConfirmDeleteNotifications(item.id)
                              }>
                              <Text style={styles.removeText}>
                                Remover notificação
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default NotificationsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 15, 25, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  headerGradient: {
  paddingHorizontal: 20,
  paddingTop: 24,
  paddingBottom: 20,
  position: 'relative',
},
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  list: {
    padding: 12,
  },
  empty: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#9aa6b2',
  },
  emptyIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  emptyText: {
    color: '#9aa6b2',
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fafbfc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1a7fe7',
    marginTop: 6,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#242a35',
    marginBottom: 4,
  },
  itemMessage: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  time: {
    marginTop: 6,
    fontSize: 11,
    color: '#9aa6b2',
  },
  actions: {
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  removeText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  confirmRemove: {
    backgroundColor: '#fff6f6',
    borderWidth: 1,
    borderColor: '#ffd2d2',
    padding: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  confirmText: {
    color: '#7f1d1d',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#eef2f7',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  cancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 12,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
