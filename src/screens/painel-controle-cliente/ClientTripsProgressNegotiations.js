import React, {useState, useCallback} from 'react';
import {
  Alert,
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

import styles from './PainelCliente.styles';
import Config from 'react-native-config';

export default function ClientTripsProgressNegotiations({
  viagensEmNegociacaoCliente = [],
  loadingViagensEmNegociacaoCliente = false,
  erroViagensEmNegociacaoCliente = null,
  onOpenChatModal,
  onOpenPhotosOrderModal,
  onOpenReceiverModal,

  redirectVisualizarViagem,
  redirectAcompanhamentoViagem,
  redirectChat,
  handleModalDadosDestinatario,
  handleFotografiasViagemNegociacao,
  handleModalExcluirViagemEmNegociacao,
}) {
  const navigation = useNavigation();

  const [visibleNegotiations, setVisibleNegotiations] = useState(2);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  const handleNavigateToPayment = async item => {
    try {
      // Remove a chave do armazenamento local
      await AsyncStorage.removeItem('payment_service');
    } catch (error) {
      console.error('Erro ao remover chave do storage:', error);
    }

    //Alert.alert("Dados da API", JSON.stringify(item, null, 2));

    // Navega para a tela passando os parâmetros via route.params
    navigation.navigate('PaymentService', {
      item,
      from: 'dashboard',
    });
  };

  const allowedStatuses = [
    '1',
    '2',
    '3',
    'destinatario_recusou',
    '4',
    '5',
    '6',
    '7',
  ];

  const filteredNegotiations = viagensEmNegociacaoCliente.filter(item =>
    allowedStatuses.includes(String(item?.trip_status)),
  );

  const handleShowMoreTripsNegotiations = () => {
    setVisibleNegotiations(prev => prev + 2);
  };

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
    }, []),
  );

  const getTransporte = tipo => {
    const normalizedTipo = (tipo || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    switch (normalizedTipo) {
      case 'aviao':
        return {name: 'flight', label: 'aviao'};
      case 'onibus':
        return {name: 'directions-bus', label: 'onibus'};
      case 'carro':
        return {name: 'directions-car', label: 'carro'};
      case 'moto':
        return {name: 'two-wheeler', label: 'moto'};
      case 'trem':
        return {name: 'train', label: 'trem'};
      default:
        return {name: 'help', label: tipo || 'Desconhecido'};
    }
  };

  const getStatusInfo = status => {
    switch (String(status || '')) {
      case '1':
        return {label: 'Aguardando pagamento'};
      case '2':
        return {label: 'Aguardando o pagamento do carteiro'};
      case '3':
        return {label: 'Aguardando os dados do destinatário'};
      case 'destinatario_recusou':
        return {label: 'Adicione novamente os dados do destinatário'};
      case '4':
        return {label: 'Aguardando a confirmação do destinatário'};
      case '5':
        return {label: 'Aguardando as fotografias da encomenda'};
      case '6':
        return {label: 'Aguardando o carteiro confirmar a Encomenda'};
      case '7':
        return {label: 'Acompanhe a encomenda até o seu destino'};
      default:
        return {label: 'Status indisponível'};
    }
  };

  const renderButton = ({title, onPress, variant = 'primary'}) => {
    const isCancel = variant === 'danger';
    return (
      <TouchableOpacity
        key={title}
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.actionBtn,
          isCancel ? styles.actionBtnDanger : styles.actionBtnPrimary,
        ]}>
        <Text
          style={[
            styles.actionBtnText,
            isCancel ? styles.actionBtnTextDanger : styles.actionBtnTextPrimary,
          ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStatusButtons = viagem => {
    const status = String(viagem?.trip_status || '');
    const serie = viagem?.serie_trip_negotiations;

    switch (status) {
      case '1':
        return (
          <>
            {renderButton({
              title: 'Efetuar pagamento',
              onPress: () => handleNavigateToPayment(viagem),
            })}
            {renderButton({
              title: 'Cancelar a encomenda',
              variant: 'danger',
              onPress: () =>
                handleModalExcluirViagemEmNegociacao &&
                handleModalExcluirViagemEmNegociacao(serie),
            })}
          </>
        );

      case '2':
        return (
          <>
            {renderButton({
              title: 'Detalhes do pagamento',
              onPress: () => handleNavigateToPayment(viagem),
            })}
          </>
        );

      case '3':
        return (
          <>
            {renderButton({
              title: 'Adicionar destinatário',
              onPress: () => onOpenReceiverModal(viagem, null),
            })}
            {renderButton({
              title: 'Chat',
              onPress: () => onOpenChatModal(viagem, 'client'),
            })}
            {renderButton({
              title: 'Detalhes do pagamento',
              onPress: () => handleNavigateToPayment(viagem),
            })}
            {renderButton({
              title: 'Cancelar a encomenda',
              variant: 'danger',
              onPress: () =>
                handleModalExcluirViagemEmNegociacao &&
                handleModalExcluirViagemEmNegociacao(serie),
            })}
          </>
        );

      case 'destinatario_recusou':
        return (
          <>
            {renderButton({
              title: 'Dados do destinatário',
              onPress: () => onOpenReceiverModal(viagem, 'receiverReadded'),
            })}
            {renderButton({
              title: 'Chat',
              onPress: () => onOpenChatModal(viagem, 'client'),
            })}
            {renderButton({
              title: 'Detalhes do pagamento',
              onPress: () => handleNavigateToPayment(viagem),
            })}
            {renderButton({
              title: 'Cancelar a encomenda',
              variant: 'danger',
              onPress: () =>
                handleModalExcluirViagemEmNegociacao &&
                handleModalExcluirViagemEmNegociacao(serie),
            })}
          </>
        );

      case '4':
        return (
          <>
            {renderButton({
              title: 'Alterar destinatário',
              onPress: () => onOpenReceiverModal(viagem, null),
            })}
            {renderButton({
              title: 'Chat',
              onPress: () => onOpenChatModal(viagem, 'client'),
            })}
            {renderButton({
              title: 'Detalhes do pagamento',
              onPress: () => handleNavigateToPayment(viagem),
            })}
          </>
        );

      case '5':
        return (
          <>
            {renderButton({
              title: 'Inserir fotografias',
              onPress: () => onOpenPhotosOrderModal(viagem, 'upload'),
            })}
            {renderButton({
              title: 'Alterar destinatário',
              onPress: () => onOpenReceiverModal(viagem, null),
            })}
            {renderButton({
              title: 'Chat',
              onPress: () => onOpenChatModal(viagem, 'client'),
            })}
            {renderButton({
              title: 'Cancelar a encomenda',
              variant: 'danger',
              onPress: () =>
                handleModalExcluirViagemEmNegociacao &&
                handleModalExcluirViagemEmNegociacao(serie),
            })}
          </>
        );

      case '6':
        return (
          <>
            {renderButton({
              title: 'Verificar as fotografias',
              onPress: () => onOpenPhotosOrderModal(viagem, 'upload'),
            })}
            {renderButton({
              title: 'Alterar destinatário',
              onPress: () => onOpenReceiverModal(viagem, null),
            })}
            {renderButton({
              title: 'Chat',
              onPress: () => onOpenChatModal(viagem, 'client'),
            })}
            {renderButton({
              title: 'Detalhes do pagamento',
              onPress: () => handleNavigateToPayment(viagem),
            })}
          </>
        );

      case '7':
        return (
          <>
            {renderButton({
              title: 'Acompanhar encomenda',
              onPress: () =>
                redirectAcompanhamentoViagem &&
                redirectAcompanhamentoViagem(serie),
            })}
            {renderButton({
              title: 'Alterar destinatário',
              onPress: () => onOpenReceiverModal(viagem, null),
            })}
            {renderButton({
              title: 'Verificar as fotografias',
              onPress: () => onOpenPhotosOrderModal(viagem, 'upload'),
            })}
            {renderButton({
              title: 'Chat',
              onPress: () => onOpenChatModal(viagem, 'client'),
            })}
          </>
        );

      default:
        return null;
    }
  };

  if (loadingViagensEmNegociacaoCliente) {
    return (
      <View style={{paddingVertical: 20, alignItems: 'center'}}>
        <ActivityIndicator size="small" color="#00AEEF" />
        <Text style={{marginTop: 8, fontFamily: 'Montserrat-Regular'}}>
          Carregando negociações...
        </Text>
      </View>
    );
  }

  if (erroViagensEmNegociacaoCliente) {
    return (
      <View style={{paddingVertical: 15, alignItems: 'center'}}>
        <Text
          style={{
            color: '#b20d26',
            fontFamily: 'Montserrat-Regular',
            textAlign: 'center',
          }}>
          {erroViagensEmNegociacaoCliente}
        </Text>
      </View>
    );
  }

  if (filteredNegotiations.length === 0) {
    return null;
  }

  return (
    <>
      <View style={{marginBottom: 12, marginTop: 30, marginLeft: 10}}>
        <Text
          style={{fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#222'}}>
          Viagens em Negociação
        </Text>
      </View>

      {filteredNegotiations
        .slice(0, visibleNegotiations)
        .map((viagem, index) => {
          const status = String(viagem?.trip_status || '');
          const trip = viagem?.trip || {};
          const traveler = viagem?.traveler || {};

          const transporte = getTransporte(trip?.meio_transporte);
          const statusInfo = getStatusInfo(status);

          const imagemViajante = traveler?.imagem
            ? `${traveler.imagem}${
                traveler.imagem.includes('?') ? '&' : '?'
              }v=${avatarVersion}`
            : null;

          return (
            <View key={viagem?.id ?? index} style={styles.cardContainer}>
              {/* TOPO: PERFIL + ORIGEM/DESTINO */}
              <View style={styles.headerProfile}>
                {imagemViajante ? (
                  <Image
                    key={avatarVersion}
                    source={{uri: imagemViajante, cache: 'reload'}}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                    <MaterialIcons name="person" size={36} color="#999" />
                  </View>
                )}

                <View style={styles.profileDetails}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {traveler?.nome || ''}
                  </Text>
                  <View style={styles.routeContainer}>
                    <Text style={styles.routeCity} numberOfLines={1}>
                      {trip?.cidade_origem || ''}
                    </Text>

                    <View style={styles.arrowCircle}>
                      <MaterialIcons
                        name="arrow-outward"
                        size={14}
                        color="#00AEEF"
                        style={{transform: [{rotate: '90deg'}]}}
                      />
                    </View>

                    <Text style={styles.routeCity} numberOfLines={1}>
                      {trip?.cidade_destino || ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* CHIPS DE INFORMAÇÃO */}
              <View style={styles.chipsContainer}>
                {/* Transporte */}
                <View style={styles.chip}>
                  <MaterialIcons
                    name={transporte.name}
                    size={15}
                    color="#FFF"
                    style={{marginRight: 4}}
                  />
                  <Text style={styles.chipText}>{transporte.label}</Text>
                </View>

                {/* Duração */}
                <View style={styles.chip}>
                  <MaterialIcons
                    name="event"
                    size={15}
                    color="#FFF"
                    style={{marginRight: 4}}
                  />
                  <Text style={styles.chipText}>
                    {trip?.duracao_viagem || ''}
                  </Text>
                </View>

                {/* Tipo de Carga */}
                <View style={styles.chip}>
                  <MaterialIcons
                    name="card-travel"
                    size={15}
                    color="#FFF"
                    style={{marginRight: 4}}
                  />
                  <Text style={styles.chipText}>
                    {viagem?.client_order_type || ''}
                  </Text>
                </View>
              </View>

              {/* DATAS SAÍDA E CHEGADA */}
              <View style={styles.datesContainer}>
                {/* SAÍDA */}
                <View style={styles.dateBlock}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>SAÍDA</Text>
                  </View>
                  <View style={styles.dateTimeRow}>
                    <MaterialIcons name="event" size={16} color="#0072FF" />
                    <Text style={styles.dateTimeText}>
                      {trip?.data_partida || ''} às {trip?.horas_partida || ''}
                    </Text>
                  </View>
                </View>

                {/* CHEGADA */}
                {/* CHEGADA */}
                <View style={styles.dateBlockRight}>
                  <View style={{alignItems: 'flex-start'}}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateBadgeText}>CHEGADA</Text>
                    </View>
                    <View style={styles.dateTimeRow}>
                      <MaterialIcons name="event" size={16} color="#0072FF" />
                      <Text style={styles.dateTimeText}>
                        {trip?.data_chegada || ''} às{' '}
                        {trip?.horas_chegada || ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* CAIXA DE DESCRIÇÃO / OBSERVAÇÃO */}
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {trip?.informacao_sobre_trajeto || ''}
                </Text>
              </View>

              {/* ÁREA DE STATUS E BOTÕES */}
              <View style={styles.statusSectionContainer}>
                {/* CARD AZUL DO STATUS */}
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={['#0084FF', '#00C6FF']}
                  style={styles.statusBannerGradient}>
                  {/* Ponto fixado no canto esquerdo com o halo transparente */}
                  <View style={styles.statusDotWrapper}>
                    <View style={styles.statusDot} />
                  </View>

                  <Text style={styles.statusBannerText}>
                    {statusInfo.label}
                  </Text>
                </LinearGradient>

                {/* BOTÕES DAS AÇÕES */}
                <View style={styles.actionButtonsContainer}>
                  {renderStatusButtons(viagem)}
                </View>
              </View>
            </View>
          );
        })}

      {visibleNegotiations < filteredNegotiations.length && (
        <View style={{alignItems: 'center', marginTop: 10, marginBottom: 20}}>
          <TouchableOpacity onPress={handleShowMoreTripsNegotiations}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={['#1a7fe7', '#19c4c9']}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 30,
                borderRadius: 999,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: 'Montserrat-Bold',
                }}>
                Exibir mais viagens
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
