const R = require('ramda');
import { MariaClient } from 'mariasql';
const { asyncPipe } = require('@lagoon/commons/dist/util');
const { query } = require('../../util/db');
const { Sql } = require('./sql');

export const Helpers = (sqlClient: MariaClient) => {
  const aliasOpenshiftToK8s = (projects: any[]) => {
    return projects.map(project => {
      return {
        ...project,
        kubernetes: project.openshift,
        kubernetesNamespacePattern: project.openshiftProjectPattern,
      }
    });
  };

  const getProjectById = async (id: number) => {
    const rows = await query(sqlClient, Sql.selectProject(id));
    const withK8s = aliasOpenshiftToK8s(rows);
    return R.prop(0, withK8s);
  };

  const getProjectByName = async (name: string) => {
    const rows = await query(sqlClient, Sql.selectProjectByName(name));
    return R.prop(0, rows);
  };

  const getProjectByEnvironmentId = async (environmentId: number, environmentType = null) => {
    const rows = await query(sqlClient, Sql.selectProjectByEnvironmentId(environmentId, environmentType));
    return R.prop(0, rows);
  };

  const getProjectsByIds = (projectIds: number[]) =>
    query(sqlClient, Sql.selectProjectsByIds(projectIds));

  return {
    aliasOpenshiftToK8s,
    getProjectById,
    getProjectsByIds,
    getProjectByEnvironmentId,
    getProjectIdByName: async (name: string): Promise<number> => {
      const pidResult = await query(sqlClient, Sql.selectProjectIdByName(name));

      const amount = R.length(pidResult);
      if (amount > 1) {
        throw new Error(
          `Multiple project candidates for '${name}' (${amount} found). Do nothing.`,
        );
      }

      if (amount === 0) {
        throw new Error(`Not found: '${name}'`);
      }

      const pid = R.path(['0', 'id'], pidResult) as string;

      return parseInt(pid, 10);
    },
    getProjectByProjectInput: async projectInput => {
      const notEmpty = R.complement(R.anyPass([R.isNil, R.isEmpty]));
      const hasId = R.both(R.has('id'), R.propSatisfies(notEmpty, 'id'));
      const hasName = R.both(R.has('name'), R.propSatisfies(notEmpty, 'name'));

      const projectFromId = asyncPipe(R.prop('id'), getProjectById, project => {
        if (!project) {
          throw new Error('Unauthorized');
        }

        return project;
      });

      const projectFromName = asyncPipe(R.prop('name'), async name => {
        const rows = await query(sqlClient, Sql.selectProjectByName(name));
        const project = R.prop(0, rows);

        if (!project) {
          throw new Error('Unauthorized');
        }

        return project;
      });

      return R.cond([
        [hasId, projectFromId],
        [hasName, projectFromName],
        [
          R.T,
          () => {
            throw new Error('Must provide project "id" or "name"');
          },
        ],
      ])(projectInput);
    },
    getAllProjects: async () => query(sqlClient, Sql.selectAllProjects()),
    getAllProjectsNotIn: async ids =>
      query(sqlClient, Sql.selectAllProjectNotIn(ids)),
    getAllProjectNames: async () =>
      R.map(
        R.prop('name'),
        await query(sqlClient, Sql.selectAllProjectNames()),
      ),
  };
};
