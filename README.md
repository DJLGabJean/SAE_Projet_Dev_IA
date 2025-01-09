# SAE_Projet_Dev_IA

## Prérequis

Le projet comporte le framework Ionic (donc penser à installer Angular puis Ionic)

- [https://angular.dev/installation]
- [https://ionicframework.com/]


Pour commencer, exécuter cette commande pour installer les dépendances du projet  :

```bash
npm install
```

## Lancement de l'application sur Navigateur Web

Exécute cette commande pour lancer l'application sur votre Navigateur Web par défaut :

```bash
ionic serve --open
```

Pour quitter l'application, n'oubliez pas de maintenir les touches CTRL+C

## Lancement de l'application sur Android

Pour pouvoir lancer l'application sur votre Android, il vous faut créer une APK

D'abord, on exécute cette commande :

```bash
ionic capacitor sync android --prod
```

> [!NOTE]
> Cette commande va permettre de synchroniser les fichiers du projet Ionic pour une application Android, en utilisant Capacitor, et construit une version de production de l'application.

Ensuite, on se dirige vers le dossier android :

```bash
cd android
```

Puis on utilise Gradle :

```bash
./gradlew assembleDebug
```

> [!IMPORTANT]
> Vous devez avoir la version de JAVA 17 dans les variables d'environnement (JAVA_HOME) pour pouvoir exécuter cette commande.

> [!NOTE]
> Cette commande permet d'assembler et générer un package de débogage pour une application Android

Enfin, on récupère l'APK de notre application et on la met sur notre Android pour l'installer :

Le _chemin_ de la création de l'APK sur le projet Ionic est `android/app/build/outputs/apk/app-debug.apk`
