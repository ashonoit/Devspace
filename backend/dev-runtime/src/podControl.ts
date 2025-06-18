// import { KubeConfig, CoreV1Api, AppsV1Api, NetworkingV1Api } from "@kubernetes/client-node";

// const kubeconfig = new KubeConfig();
// kubeconfig.loadFromDefault();
// kubeconfig.setCurrentContext("minikube");

// const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
// const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
// const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

// const k8sNamespace = "default";

export const deleteResourcesBySpaceId = async (spaceId: string) => {
    try {
        console.log(`Cleaning up resources for spaceId: ${spaceId}`);
        // await appsV1Api.deleteNamespacedDeployment(spaceId, k8sNamespace);
        // await coreV1Api.deleteNamespacedService(spaceId, k8sNamespace);
        // await networkingV1Api.deleteNamespacedIngress(spaceId, k8sNamespace);
    } catch (error) {
        console.error(`Failed to delete resources for ${spaceId}:`, error);
    }
};
