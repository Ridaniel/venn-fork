import * as React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ListOfElementsComponentProps {
  styles: Record<string, string | number>;
  elements: string[];
  removeElement: (index: number) => void;
}

const ListOfElementsComponent = (props: ListOfElementsComponentProps) => {
  return (
    <ScrollView>
      <View style={{...styles.ListOfElementscontainer, ...props.styles}}>
        {props.elements.map((element: string, index: number) => (
          <View key={element} style={styles.element}>
            <Text key={element} style={styles.elementText}>
              {element}
            </Text>
            <TouchableOpacity
              style={styles.elementButton}
              onPress={() => {
                props.removeElement(index);
              }}>
              <Text style={styles.elementButtonText}>x</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ListOfElementsComponent;

const styles = StyleSheet.create({
  ListOfElementscontainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: 'white',
  },
  element: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#707070',
    marginRight: 5,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  elementText: {
    fontSize: 14,
    color: '#000000',
    marginRight: 5,
  },
  elementButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#707070',
    backgroundColor: '#FF2424',
  },
  elementButtonText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'white',
  },
});