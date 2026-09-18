import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

/*
  Reads stock.products — an array of entries with the exact shape
  StockF's formOutput() produces:
  {
    name: string,             // product name, from StockF's "Nome do(s) produto(s) estocado(s)"
    quantity: string,         // e.g. "16"
    lastAcquisition: string,  // "dd/mm/aaaa"
    items: [],                // optional breakdown list ({ name, quantity } pairs)
    foto: string | null,      // uri of the product's cover photo
  }

  `stock` is null until the user either creates a new one (CreateStockF,
  opened via func('createStock')) or connects to an existing one by code
  (ConnectStockF, opened via func('connectStock')) — a user has at most
  one stock, but a stock can be shared by several users.
*/

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

export default function Stock({ stock, func }) {
  const products = stock?.products ?? [];

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
      {!!stock && <Text style={styles.stockId}>ID do estoque: {stock.id}</Text>}

      {!stock ? (
        <NoStock func={func} />
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum produto estocado</Text>
      ) : (
        products.map((product, index) => (
          <View key={index} style={styles.card}>
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
                Quantidade: {product.quantity} unidades
              </Text>
              <Text style={styles.productLine}>
                Última aquisição: <Text style={styles.boldText}>{product.lastAcquisition}</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => func('stock', product)}>
              <Feather name="edit-2" size={18} color="#36A06F" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const THUMB_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stockId: {
    fontSize: 13,
    color: '#808080',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  emptyText: {
    fontSize: 15,
    color: '#808080',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  noStockWrap: {
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#36A06F',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#F5F5F5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#36A06F',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#36A06F',
    fontWeight: 'bold',
    fontSize: 16,
  },
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
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
  },
  thumbPlaceholder: {
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
    paddingRight: 24,
  },
  productName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#36A06F',
    marginBottom: 2,
  },
  productLine: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  boldText: {
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
});