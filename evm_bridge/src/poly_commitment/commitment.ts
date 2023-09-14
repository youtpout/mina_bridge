import { Group, Scalar } from "o1js";
import { Verifier } from "../verifier/Verifier.js";

export class PolyComm<A> {
    unshifted: A[]
    shifted?: A

    constructor(unshifted: A[], shifted?: A) {
        this.unshifted = unshifted;
        this.shifted = shifted;
    }

    zip<B>(other: PolyComm<B>): PolyComm<[A, B]> {
        let unshifted = this.unshifted.map((u, i) => [u, other.unshifted[i]] as [A, B]);
        let shifted = (this.shifted && other.shifted) ?
            [this.shifted, other.shifted] as [A, B] : undefined;
        return new PolyComm<[A, B]>(unshifted, shifted);
    }

    map<B>(f: (x: A) => B): PolyComm<B> {
        let unshifted = this.unshifted.map(f);
        let shifted = (this.shifted) ? f(this.shifted) : undefined;
        return new PolyComm<B>(unshifted, shifted);
    }

    static msm(com: PolyComm<Group>[], elm: Scalar[]): PolyComm<Group> {
        if (com.length === elm.length) {
          // FIXME:: error
        }

        let unshifted_len = Math.max(...com.map(pc => pc.unshifted.length));
        let unshifted = Array(unshifted_len);

        for (let chunk = 0; chunk < unshifted_len; chunk++) {
            let points_and_scalars = com
                .map((c, i) => [c, elm[i]] as [PolyComm<Group>, Scalar]) // zip with scalars
                // get rid of scalars that don't have an associated chunk
                .filter(([c, _]) => c.unshifted.length > chunk)
                .map(([c, scalar]) => [c.unshifted[chunk], scalar] as [Group, Scalar]);

            // unzip
            let points = points_and_scalars.map(([c, _]) => c);
            let scalars = points_and_scalars.map(([_, scalar]) => scalar);

            let chunk_msm = Verifier.msm(points, scalars);
            unshifted.push(chunk_msm);
        }
        
        let shifted_pairs = com
                .filter((c) => c.shifted) // filter those that don't have a shifted property
                .map((c, i) => [c.shifted, elm[i]] as [Group, Scalar]); // zip with scalars
                // get rid of scalars that don't have an associated chunk

        let shifted = undefined;
        if (shifted_pairs.length != 0) {
            // unzip
            let points = shifted_pairs.map(([c, _]) => c);
            let scalars = shifted_pairs.map(([_, scalar]) => scalar);
            shifted = Verifier.msm(points, scalars);
        }

        return new PolyComm<Group>(unshifted, shifted);
    }
}

export class BlindedCommitment<C, S> {
    commitment: PolyComm<C>
    blinders: PolyComm<S>
}
