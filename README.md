* M999, le processeur débranché

L'objectif de cet activité est de montrer le fonctionnement d'un
processeur. Le matériel est constitué d'une feuille A3 à plastifier
pour représenter les cases de la mémoire, plus un décodeur d'opcode à
découper, avec des tirettes.

La mémoire est composée de 100 cases, auxquelles s'ajoutent 6
registres génériques (nommés de r0 à r5) et un registre d'instruction
PC dénotant la case mémoire de la prochaine instruction à exécuter.
Les deux premiers registres ne sont pas modifiables : la valeur de r0
est fixée à 0, et celle de r1 est fixée à 1. Au final, seuls les
registres r2 à r5 sont disponibles pour le programmeur.

Les deux cases mémoires 0 et 1 sont particulières car elles servent
aux I/O. Les lectures dans la case 0 correspondent à des entrées
clavier tandis que les écritures dans la case 1 correspondent à des
écritures à l'écran. On ne peut pas écrire dans la case 0 ni lire dans
la case 1.

Les autres cases mémoire peuvent contenir un nombre décimal de 000 à
999, qui représente soit une donnée arbitraire, soit un opcode
exécutable. Pour les opcodes, le chiffre des centaines représente
l'instruction à exécuter, le chiffre des dizaines représente
l'opérande A tandis que le chiffre des unités est l'opérande B. 

Voici la signification des différentes valeurs possibles pour les
opérandes :

  - 0: r0 (valeur du registre 0, qui est fixée à 0 par définition)
  - 1: r1 (valeur du registre 1, qui est fixée à 1 par définition)
  - 2: r2 (valeur du registre 2, qui change)
  - 3: r3
  - 4: r4
  - 5: r5
  - 6: @r2 (mémoire centrale, dans la case pointée par r2)
  - 7: @r3
  - 8: @r4
  - 9: @r5
  
Dans la version simplifiée, le M999 dispose des 6 instructions
suivantes:

  - 0: HALT: la machine s'arrête
  - 1: MOVE A B: Move la valeur de B dans A
    - Si AB est de forme @ri rj, c'est un STORE: registre vers mémoire
      Exemple: 163 écrit la valeur de r3 dans la case pointée par r2
    - Si BA est de forme ri @rj, c'est un LOAD: mémoire vers registre
      Exemple: 136 charge dans r3 la case mémoire dont l'adresse est dans r2.
    - Les autres formes n'ont pas de nom habituel en asm (je crois).
  - 2: ADD A B: Ajoute la valeur de B dans A
  - 3: SUB A B: Soustrait la valeur de B à l'adresse A
  - 4: JPNZ A B: Jump en B si A est différent de 0
  - 5: JPP A B: Jump en B si A est positif
  
Une version étendue permet de faire des appels de fonctions. Dans ce
cas, le registre 5 n'est plus générique. Il stoque le sommet de pile
(valeur initiale: 99). On dispose alors des quatre instructions
supplémentaires suivantes permettant d'empiler/dépiler des paramètres
sur la pile, et de faire des appels de sous-fonctions.

  - 6: PUSH A { MOVE A @r5 ; SUB r5 r1 }
  - 7: POP  A { ADD r5 r1 ; MOVE @r5 A }
  - 8: CALL A { MOVE PC @r5 ; SUB r5 r1 ; MOVE A PC } 
  - 9: RET    { ADD r5 r1 ; MOVE @r5 PC }
