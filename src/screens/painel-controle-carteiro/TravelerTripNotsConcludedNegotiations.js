import React, {useState, useCallback} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from './PainelCarteiro.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const URL_MAIN = Config.URL_MAIN;

export default function TravelerTripNotsConcludedNegotiations({
  viagensNaoEfetivadasCarteiro,
  loadingViagensNaoEfetivadasCarteiro,
}) {
  const {height, width} = useWindowDimensions();
  const isSmall = width < 360;
  const [fastest, setFastest] = useState(true);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  const availableWidthNoRaio = width - 68;
  const avatarWidthNoRaio = 52;

  let iconSizeNoRaio = 20;
  let iconTextSizeNoRaio = 12;
  let iconBoxWidthNoRaio = 70;

  if (width < 350) {
    iconSizeNoRaio = 16;
    iconTextSizeNoRaio = 10;
    iconBoxWidthNoRaio = 55;
  } else if (width < 450) {
    iconSizeNoRaio = 18;
    iconTextSizeNoRaio = 11;
    iconBoxWidthNoRaio = 50;
  }

  const totalIconsWidthNoRaio = iconBoxWidthNoRaio * 3 + 8 * 2;
  const userInfoMaxWidthNoRaio =
    availableWidthNoRaio - avatarWidthNoRaio - totalIconsWidthNoRaio - 10;
  const isSmallScreenNoRaio = width < 400;

  const getTransporteViagensEmAndamento = tipo => {
    const normalizedTipo = (tipo || '')
      .normalize('NFD') // separa acentos das letras
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase(); // deixa tudo minúsculo

    switch (normalizedTipo) {
      case 'aviao':
        return {name: 'flight', label: 'Avião'};
      case 'onibus':
        return {name: 'directions-bus', label: 'Ônibus'};
      case 'carro':
        return {name: 'directions-car', label: 'Carro'};
      case 'moto':
        return {name: 'two-wheeler', label: 'Moto'};
      case 'trem':
        return {name: 'train', label: 'Trem'};
      default:
        return {name: 'help', label: 'Desconhecido'};
    }
  };

  const getStatusBtnsCardsViagensEmAndamento = condicao_viagem => {
    switch (condicao_viagem || '') {
      case condicao_viagem:
        return {
          accao_necessaria_encomenda_em_negociacao: `Status: ${condicao_viagem}`,
          btns_viagens_em_negociacao: [],
        };
      /*case 'Viagem Indisponibilizada':
        return {
          accao_necessaria_encomenda_em_negociacao: 'Status: Viagem Indisponibilizada',
          btns_viagens_em_negociacao: []
        };
        case 'Desistencia':
        return {
          accao_necessaria_encomenda_em_negociacao: 'Status: Desistencia',
          btns_viagens_em_negociacao: []
        };
        case 'Desistencia':
        return {
          accao_necessaria_encomenda_em_negociacao: 'Status: Desistencia',
          btns_viagens_em_negociacao: []
        };*/
      default:
        return {
          accao_necessaria_encomenda_em_negociacao: 'Status desconhecido',
          btns_viagens_em_negociacao: [],
        };
    }
  };

  useFocusEffect(
    useCallback(() => {
      setAvatarVersion(Date.now());
    }, []),
  );

  return (
    <>
      <View>
        {viagensNaoEfetivadasCarteiro.map((viagem, index) => {
          const transporteNoRaio = getTransporteViagensEmAndamento(
            viagem.meio_transporte === 'Avião'
              ? 'aviao'
              : viagem.meio_transporte,
          );

          const statusBtnsViagensEmAndamento =
            getStatusBtnsCardsViagensEmAndamento(viagem.condicao_viagem);

          return (
            <View key={index} style={styles.card}>
              {/* ORIGEM / DESTINO */}
              <View style={styles.origemDestino}>
                <View style={styles.cidade}>
                  <Text style={styles.cidadeTitulo} numberOfLines={1}>
                    {viagem.local_partida}
                  </Text>
                  <Text style={styles.cidadeData} numberOfLines={1}>
                    {viagem.data_partida_para_busca} às {viagem.hora_partida}
                  </Text>
                </View>

                <Text style={styles.separador}>•••</Text>

                <View style={[styles.cidade, {alignItems: 'flex-end'}]}>
                  <Text style={styles.cidadeTitulo} numberOfLines={1}>
                    {viagem.local_chegada}
                  </Text>
                  <Text style={styles.cidadeData} numberOfLines={1}>
                    {viagem.data_chegada_para_busca} às {viagem.hora_chegada}
                  </Text>
                </View>
              </View>

              {/* USUÁRIO + ICONES */}
              <View style={styles.usuarioLinha}>
                <View style={styles.usuario}>
                  <Image
                    key={avatarVersion}
                    source={{
                      uri: `${URL_MAIN}/views/painel-controle-carteiro/img-carteiro/${viagem.serie_estrangeira_carteiro}/img.png?v=${avatarVersion}`,
                      cache: 'reload',
                    }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.nomeUsuario} numberOfLines={1}>
                      {viagem.nome_carteiro}
                    </Text>
                    <Text style={styles.subUsuario}>Carteiro</Text>
                  </View>
                </View>

                <View style={styles.infoTransporte}>
                  {[
                    transporteNoRaio,
                    {name: 'schedule', label: viagem.total_horas},
                    {name: 'work', label: 'Mala P'},
                  ].map((item, i) => (
                    <View key={i} style={styles.cardInfo}>
                      <MaterialIcons
                        name={item.name}
                        size={18}
                        color="#0090e8"
                        style={{marginTop: 5}}
                      />
                      <Text style={styles.cardInfoText} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* STATUS + FECHAR */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 15,
                }}>
                <View style={{flexDirection: 'row', marginBottom: 10}}>
                  <Text style={[styles.typeStatusCard, {width: '100%'}]}>
                    {
                      statusBtnsViagensEmAndamento.accao_necessaria_encomenda_em_negociacao
                    }
                  </Text>
                </View>
              </View>

              {/* BOTÕES */}
              <View style={styles.areaBotoes}>
                {statusBtnsViagensEmAndamento.btns_viagens_em_negociacao.map(
                  (btn, i) => (
                    <View key={i} style={styles.botaoWrapper}>
                      {btn}
                    </View>
                  ),
                )}
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}
