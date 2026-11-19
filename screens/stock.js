import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

function NoStock({ func }) {
  return (
    <View style={styles.noStockWrap}>
      <Text style={styles.emptyText}>Você ainda não está conectado a nenhum estoque</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => func('createStock')}>
        <Text style={styles.primaryButtonText}>Criar novo estoque</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => func('connectStock')}>
        <Text style={styles.secondaryButtonText}>Conectar a um estoque existente</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Stock({ stock, func, onDisconnect, onRemove, onUpdateQuantity }) {
  const products = stock?.products ?? [];

  const handleChangeQuantity = (product, delta) => {
    const currentQty = parseInt(product.quantity, 10) || 0;
    const newQty = Math.max(0, currentQty + delta); // Evita quantidade negativa
    onUpdateQuantity?.(product, newQty);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Produtos estocados</Text>
        {!!stock && (
          <TouchableOpacity onPress={() => func('stock')}>
            <Feather name="plus" size={26} color="#36A06F" />
          </TouchableOpacity>
        )}
      </View>
      {!!stock && <Text style={styles.stockId}>Código do estoque: {stock.codigo ?? stock.id}</Text>}

      {!stock ? (
        <NoStock func={func} />
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum produto estocado</Text>
      ) : (
        products.map((product, index) => (
          <View key={product.id ?? index} style={styles.card}>
            {product.foto ? (
              <Image source={{ uri: product.foto }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Feather name="package" size={28} color="#B3B3B3" />
              </View>
            )}
            
            <View style={styles.cardInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productLine}>
                Última aquisição: <Text style={styles.boldText}>{product.lastAcquisition}</Text>
              </Text>

              {/* Controles rápidos de quantidade (+ / -) */}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleChangeQuantity(product, -1)}
                >
                  <Feather name="minus" size={16} color="#1A1A1A" />
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{product.quantity} un.</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleChangeQuantity(product, 1)}
                >
                  <Feather name="plus" size={16} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão para abrir o form individual de edição */}
            <TouchableOpacity style={styles.editButton} onPress={() => func('editStock', product)}>
              <Feather name="edit-2" size={18} color="#36A06F" />
            </TouchableOpacity>
          </View>
        ))
      )}

      {!!stock && (
        <View style={styles.stockActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => onDisconnect?.()}>
            <Text style={styles.secondaryButtonText}>Desconectar do estoque</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButton} onPress={() => onRemove?.()}>
            <Text style={styles.dangerButtonText}>Remover estoque</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const THUMB_SIZE = 90;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  stockId: { fontSize: 13, color: '#808080', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#36A06F' },
  emptyText: { fontSize: 15, color: '#808080', textAlign: 'center', marginTop: 24, marginBottom: 20 },
  noStockWrap: { marginTop: 8, gap: 12 },
  primaryButton: { backgroundColor: '#36A06F', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { color: '#F5F5F5', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { borderWidth: 1, borderColor: '#36A06F', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  stockActions: { gap: 12, marginTop: 8, marginBottom: 24 },
  dangerButton: { borderWidth: 1, borderColor: '#D64545', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  dangerButtonText: { color: '#D64545', fontWeight: 'bold', fontSize: 16 },
  secondaryButtonText: { color: '#36A06F', fontWeight: 'bold', fontSize: 16 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8 },
  thumbPlaceholder: { backgroundColor: '#E6E6E6', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, gap: 4, paddingRight: 28, justifyContent: 'center' },
  productName: { fontSize: 17, fontWeight: 'bold', color: '#36A06F' },
  productLine: { fontSize: 13, color: '#4D4D4D' },
  boldText: { fontWeight: 'bold', color: '#1A1A1A' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  qtyBtn: {
    backgroundColor: '#E6F5EC',
    borderWidth: 1,
    borderColor: '#36A06F',
    borderRadius: 6,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    minWidth: 45,
    textAlign: 'center',
  },
  editButton: { position: 'absolute', right: 12, top: 12 },
});