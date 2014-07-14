#include <cstdio>
#include <cassert>

#include <flann/flann.hpp>

typedef flann::Index< flann::L2<float> > IndexType;
typedef IndexType* IndexPtr;

extern "C" {

/**
 * data is input param, Q * K matrix of queries
 * ids will be populated with Q * nn record ids
 * dists will be populated with matching Q * nn distances
 * nn is number of neighbors to search
 * Q is number of quereis
 * K is dimensionality of input space.
 */
int knnSearch(
    IndexPtr idx,
    float *data,
    int *ids,
    float *dists,
    int nn,
    int Q,
    int K
  );

/**
 * data is N * K matrix of floats representing input vectors
 * options are containing index params in key=value form.
 * if options is NULL then auto_tuned_index will be used.
 */
IndexPtr buildFromDataset(
    float *data,
    int N,
    int K,
    const char *options
  );

/**
 * build from file
 */
IndexPtr buildFromFile(
    float *data,
    int N,
    int K,
    const char *filename
  );

/**
 * serialize index to file
 */
void saveIndex(
    IndexPtr idx,
    const char *filename
  );

/**
 * release index memory
 */
void destroyIndex(
    IndexPtr idx
  );

/**
 * dimensionality of vectors in index.
 */
int indexVeclen(
    IndexPtr idx
  );

/**
 * number of elements in index
 */
int indexSize(
    IndexPtr idx
  );

/**
 * return index parameters as foo1=bar1 foo2=bar2 string
 * this function allocates memory that should be free-ed by caller
 */
char* indexParameters(
    IndexPtr idx
  );

// veclen
// size
}

