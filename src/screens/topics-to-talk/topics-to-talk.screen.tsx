import {API} from '@aws-amplify/api';
import {GraphQLQuery} from '@aws-amplify/api/lib-esm/types';
import * as React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import ErrorComponent from '../../components/error.component';
import ListOfElementsComponent from '../../components/list-of-elements.component';
import NavigationComponent from '../../components/navigation.component';
import StepComponent from '../../components/step.component';
import SubtitleComponent from '../../components/subtitle.component';
import TextInputComponent from '../../components/text-input.component';
import TitleComponent from '../../components/title.component';
import {UserContext} from '../../contexts/user.context';
import {
  CreateUser,
  createUserMutation,
} from '../../graphql/user/mutations.user.graphql';

const TopicsToTalkScreen = ({navigation}: any) => {
  const userContext = React.useContext(UserContext);

  // declared for topic to talk
  const [topicToTalk, setTopicToTalk] = React.useState('');

  // declared for list of topic to talk
  const [listOfTopicToTalk, setListOfTopicToTalk] = React.useState<string[]>(
    [],
  );

  const [errorMessage, setErrorMessage] = React.useState('');

  const onPressBackButton = () => {
    navigation.navigate('MyData');
  };
  const onPressNextButton = async () => {
    if (isValidateListOfTopicToTalk(listOfTopicToTalk)) {
      userContext.user.topicsToTalk = listOfTopicToTalk;
      await createUser();
      navigation.navigate('Home');
    }
  };

  /// Functions for topic to talk
  const onChangeTopicToTalk = (newTopicToTalk: string) => {
    setTopicToTalk(clearTopicToTalk(newTopicToTalk));
  };
  const clearTopicToTalk = (newTopicToTalk: string): string => {
    let cleanNewTopicToTalk = newTopicToTalk;
    const alphanumericRegex = /[^a-zA-Z0-9]/g;
    if (
      cleanNewTopicToTalk !== '' &&
      alphanumericRegex.test(cleanNewTopicToTalk)
    ) {
      cleanNewTopicToTalk = cleanNewTopicToTalk.replace(alphanumericRegex, '');
    }
    if (cleanNewTopicToTalk.length > 20) {
      cleanNewTopicToTalk = cleanNewTopicToTalk.substring(0, 20);
    }
    return cleanNewTopicToTalk;
  };
  const addTopicToTalkToList = () => {
    if (
      topicToTalk !== '' &&
      !listOfTopicToTalk.some(
        topicToTalkRegister =>
          topicToTalkRegister.toLowerCase() === topicToTalk.toLowerCase(),
      )
    ) {
      listOfTopicToTalk.push('#'.concat(topicToTalk));
      setListOfTopicToTalk([...listOfTopicToTalk]);
      setTopicToTalk('');
    }
  };

  /// Functions for list for topics to talk
  const removeTopicToTalk = (indexOfListOfTopicToTalk: number) => {
    listOfTopicToTalk.splice(indexOfListOfTopicToTalk, 1);
    setListOfTopicToTalk([...listOfTopicToTalk]);
    return listOfTopicToTalk;
  };
  const isValidateListOfTopicToTalk = (newListOfTopicToTalk: string[]) => {
    const isValidated = true;
    setErrorMessage('');
    if (newListOfTopicToTalk.length === 0) {
      setErrorMessage(
        'Debes tener seleccionado al menos un tema para poder conversar!',
      );
      return false;
    }
    return isValidated;
  };

  // Persistence
  const createUser = async () => {
    try {
      const response = await API.graphql<GraphQLQuery<CreateUser>>(
        createUserMutation({
          nickname: userContext.user.nickname as string,
          birthday: userContext.user.birthday as string,
          gender: userContext.user.gender as string,
          topicsToTalk: userContext.user.topicsToTalk as string[],
          topicsToListen: userContext.user.topicsToListen as string[],
        }),
      );
      userContext.user = {...response?.data?.createUser};
      console.info(
        `User ${userContext.user.nickname} was registered correctly`,
      );
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <SafeAreaView style={styles.topicsToTalkContainer}>
      <NavigationComponent
        onPressBackButton={onPressBackButton}
        onPressNextButton={onPressNextButton}
        style={styles.navigation}
      />
      <StepComponent total={4} actualStep={3} style={styles.step} />
      <TitleComponent text="¿De que puedo hablar?" style={styles.title} />
      <SubtitleComponent
        text="Un nuevo amigo espera con ansias poder escucharte!"
        style={styles.subtitle}
      />
      <ListOfElementsComponent
        styles={{}}
        elements={listOfTopicToTalk}
        removeElement={removeTopicToTalk}
      />
      <TextInputComponent
        value={topicToTalk}
        placeholder="Puedo Hablar de ..."
        style={styles.textInput}
        onChangeText={onChangeTopicToTalk}
        onSubmitEditing={addTopicToTalkToList}
      />
      <ErrorComponent text={errorMessage} />
    </SafeAreaView>
  );
};

export default TopicsToTalkScreen;

const styles = StyleSheet.create({
  topicsToTalkContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  navigation: {
    marginBottom: 12,
  },
  step: {
    marginBottom: 27,
  },
  title: {
    marginBottom: 78,
  },
  subtitle: {
    marginBottom: 78,
  },
  textInput: {
    marginBottom: 10,
  },
});