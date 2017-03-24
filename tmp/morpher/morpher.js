/**
 * Prove on concept for morphing snapshots of parameter values based on weights
 * and with selectable parameters to be included in the morphing.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 *
 * @constructor
 */
function Merger() {

    var self = this;

    function createSnapshot(name, a,b,c, selected) {
        return {
            name: name,
            a: ko.observable(a),
            b: ko.observable(b),
            c: ko.observable(c),
            weight: ko.observable(0),
            isSnapshot: /^Snap/.test(name),
            isResult: /^Result/.test(name),
            isHighlighted: ko.observable(false),
            highlight: function() {
                this.isHighlighted(true);
            },
            unhighlight: function() {
                this.isHighlighted(false);
            }
        };
    }

    function createRandomSnapshot(name) {
        return createSnapshot(name, Math.random()*127 >> 0, Math.random()*127 >> 0, Math.random()*127 >> 0);
    }

    this.snapshots = [
        createSnapshot('Snap1', 0,64,127),
        createSnapshot('Snap2', 127,64,0),
        createSnapshot('Snap3', 64, 64, 64),
        createSnapshot('Snap4', 0, 0, 0),
        createSnapshot('Snap5', 127, 127, 127),
        createRandomSnapshot('Snap6'),
        createRandomSnapshot('Snap7'),
        createRandomSnapshot('Snap8')
    ];


    this.useA = ko.observable(true);
    this.useB = ko.observable(true);
    this.useC = ko.observable(true);

    this.reference = ko.observable();
    this.reference.subscribe(function() {
        // reset weights when setting new reference
       self.resetMorphWeights();
    });

    this.dawValueSnapshot = createSnapshot('Actual DAW values', 0, 0, 0);

    this.saveDawValuesToSnapshot = function(snapshot) {
        snapshot.a(self.dawValueSnapshot.a());
        snapshot.b(self.dawValueSnapshot.b());
        snapshot.c(self.dawValueSnapshot.c());
    };

    this.loadSnapshotToDawValues = function(snapshot) {
        self.dawValueSnapshot.a(snapshot.a());
        self.dawValueSnapshot.b(snapshot.b());
        self.dawValueSnapshot.c(snapshot.c());
    };

    this.resetMorphWeights = function() {
        _.each(self.snapshots, function(snap) {
            snap.weight(0);
        })
    };

    this.result = ko.computed(function() {
        if (!self.reference()) return;

        var ref = self.reference(),
            a = parseInt(ref.a(), 10),
            b = parseInt(ref.b(), 10),
            c = parseInt(ref.c(), 10),
            useA = self.useA(),
            useB = self.useB(),
            useC = self.useC(),
            diffA = 0,
            diffB = 0,
            diffC = 0,
            MAX_VALUE = 127,
            totalWeight = 0;

        _.each(self.snapshots, function(snap) {
            totalWeight += parseInt(snap.weight());
        });

        _.each(self.snapshots, function(snap) {
            var weight = parseInt(snap.weight()),
                normalizationFactor = weight && (weight / totalWeight) * (weight / MAX_VALUE);

            if (!weight) return;

            if (useA) {
                diffA += (parseInt(snap.a()) - a) * normalizationFactor;
            }
            if (useB) {
                diffB += (parseInt(snap.b()) - b) * normalizationFactor;
            }
            if (useC) {
                diffC += (parseInt(snap.c()) - c) * normalizationFactor;
            }
        });

        a += Math.round(diffA);
        b += Math.round(diffB);
        c += Math.round(diffC);

        // final phase
        self.dawValueSnapshot.a(a);
        self.dawValueSnapshot.b(b);
        self.dawValueSnapshot.c(c);
    });

    this.setReference = function(snap) {
        if (self.reference() === snap) {
            self.reference(null);
        } else {
            self.reference(snap);
        }
    };

    function updateResult() {
        if (!self.reference) return;
    };
}

ko.applyBindings(new Merger());