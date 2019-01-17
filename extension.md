# Une extension au M999

Corentin Ferry, 17 janvier 2019

Ce fichier contient quelques idées d'extension du jeu d'instructions du M999.
L'objectif est d'avoir un mécanisme de call / ret sans pour autant dépasser les
10 instructions.

------------------------------------------------------------

## Mémoire

Pas la peine de faire plus de 100 cases mémoire : l'exécution du
programme 3 prend déjà plusieurs minutes avec les tirettes, donc un
programme de 100 instructions aura peu de chances d'être exécuté en un
temps raisonnable (une séance).

## Valeurs immédiates

Le load immédiat sur les registres permet de s'affranchir du r0-r1
constant. En revanche ça reste bien pratique pour avoir un saut
inconditionnel avec le BNZ : BNZ r1, [target]. On peut cependant prendre
un registre général, y mettre 01, et faire le branchement (mais ça coûte
quelques instructions pour sauvegarder la valeur courante du registre
utilisé pour ça).

## Pop et push, call et ret

Un pop / push serait vraiment le bienvenu pour sauvegarder les
registres, quitte à avoir deux registres (sommet de pile et base) en
plus. A priori on n'a pas besoin de manipuler directement ces registres
(en utilisant la pile comme une LIFO) donc ça ne pose pas de problème
pour les tirettes. On peut aussi proposer de supprimer SETR3/4/5 pour faire de
la place et ne laisser que SETR2, ça devrait suffire pour des valeurs
immédiates. J'approuve ce changement.

Pour le call / ret qui serait fait dans cet esprit, je propose d'avoir
un format de frame commençant toujours par les valeurs précédentes de
stack base (=frame pointer, je ne sais comment l'appeler) et PC, comme
suit en exemple :

```
  82 > stack top
  83 > valeur
  84 > stack base précédent = 87
  85 > PC précédent = ??
  --- Frame précédente ---
  86 > valeur
  87 > valeur
  88 > stack base précédent
  89 > PC précédent
  --- Frame précédente ---
  90 > valeur
  91-96 > .....
  97 > valeur
  98 > valeur
  --- Fin 1ère frame (pas de PC / SB précédent) ---
  99 > I/O
```

Sur cet exemple, SB = 83, ST = 82. Le PC et SB précédent ne sont pas
comptés.  Avec ça, pas la peine de stocker la valeur précédente du stack
pointer, qui est normalement stack base-3.

L'ISA correspondant serait donc : move, add, sub, jnz, jpp, set0,
push, pop, call, ret.

## On manque de registres sur les tirettes !

Pour avoir @r0 sur les tirettes d'opérandes, on peut repasser à 5
registres (mais tous généraux, sans en fixer un à 0).


On peut bouger le IO à l'adresse 99 (une seule case pour le IO),
ainsi le programme démarre à 00. Pour l'instant les programmes démarrent
à 10.

Le PC peut être bougé sur la feuille mémoire. La tirette sert peu. En
revanche il faut garder le PC car sans l'utiliser, on s'est perdus. (et
fondamentalement, un processeur sans PC, ça n'existe pas).

