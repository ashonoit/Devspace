import { Request,Response } from "express";
import path from "path";
import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api, ERROR } from "@kubernetes/client-node";
import { hasStatusCode } from "../utils/hasStatusCode";
import { readAndParseKubeYaml } from "../utils/readAndParseKubeYaml";

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
kubeconfig.setCurrentContext("minikube");
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

const checkPodExists = async (k8sNamespace: string, spaceId: string) => {
    try {
        const pods = await coreV1Api.listNamespacedPod(k8sNamespace);
        // Check if any pod has a matching label or name with the spaceId
        const podExists = pods.body.items.some(pod => pod.metadata?.name?.includes(spaceId) || pod.metadata?.labels?.['app'] === spaceId);
        console.log("Pod already exists");
        return podExists;
    } catch (error) {
        console.error("Failed to check pods", error);
        return false;
    }
}

const startPod = async (req: Request, res: Response): Promise<void> => {
    const { userId, spaceId } = req.body;
    const k8sNamespace = "default";

    try {
        const podExists = await checkPodExists(k8sNamespace, spaceId);
        if (podExists) {
            res.status(200).send({ message: "Pod with the same spaceId already exists" });
            return;
        }

        const kubeManifests = readAndParseKubeYaml(
            path.join(__dirname, "../../service.yaml"),
            spaceId
        );

        for (const manifest of kubeManifests) {
            switch (manifest.kind) {
                case "Deployment":
                    await appsV1Api.createNamespacedDeployment(k8sNamespace, manifest);
                    break;
                case "Service":
                    await coreV1Api.createNamespacedService(k8sNamespace, manifest);
                    break;
                case "Ingress":
                    await networkingV1Api.createNamespacedIngress(k8sNamespace, manifest);
                    break;
                default:
                    console.log(`Unsupported kind: ${manifest.kind}`);
            }
        }

        console.log(`${spaceId} Pod created successfully`);
        res.status(200).send({ message: "Resources created successfully" });

    } catch (error: any) {
        if (hasStatusCode(error) && error.statusCode === 409) {
            res.status(200).send({ message: "Pod already exists" });
            return;
        }

        console.error("Failed to create resources", error);
        res.status(500).send({ message: "Failed to create resources" });
    }
};

//------------------------Destroy the Pod---------------------------------------------
const destroyPod = async (req: Request, res: Response) => {
  try {
    const { userId, spaceId } = req.body;
    const k8sNamespace = "default";

    const podExists = await checkPodExists(k8sNamespace, spaceId);
    if (!podExists) {
      res.status(200).send({ message: "Pod with the same spaceId doesn't exist: cannot destroy" });
      return;
    }

    console.log(`Cleaning up resources for spaceId: ${spaceId}`);
    await appsV1Api.deleteNamespacedDeployment(spaceId, k8sNamespace);
    await coreV1Api.deleteNamespacedService(spaceId, k8sNamespace);
    await networkingV1Api.deleteNamespacedIngress(spaceId, k8sNamespace);

    console.log(`Destroyed resources of ${spaceId}`);
    res.status(200).send({ message: `Resources for spaceId ${spaceId} destroyed successfully` });

  } catch (error) {
    console.error("Failed to destroy resources: ", error);
    res.status(500).send({ message: "Failed to destroy resources" });
  }
};

export {startPod,destroyPod};